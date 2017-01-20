var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var express = require('express');
var extend = require('xtend');
var forms = require('forms');

var collectFormErrors= require('express-stormpath/lib/helpers').collectFormErrors;

// CREATE PROFILE FORM 
var profileForm = forms.create({
   givenName : forms.fields.string({
       required:true
   }),
   surname : forms.fields.string({required:true}),
   streetAddress : forms.fields.string(),
   city : forms.fields.string(),
   state : forms.fields.string(),
   zip : forms.fields.string()
});

// RENDER FORM TO RENDER OUR FOMR AND PROVIE THE VALUES

function renderForm(req,res,locals){
	res.render('profile',extend({
      title: 'My Profile',
      csrfToken : req.csrfToken(),
      givenName : req.user.givenName,
      surname : req.user.surname,
      streetAddress : req.user.customData.streetAddress,
      city : req.user.customData.city,
      state : req.user.customData.state,
      zip : req.user.customData.zip
  }, locals || {}));
}

module.exports = function profile(){
	var router = express.Router();
	router.use(cookieParser());
    router.use(bodyParser.urlencoded({extended:true}));
    router.use(csurf({cookie:true}));

    router.all('/',function(request,response){
        profileForm.handle(request,{
        	success : function(form){
        	    request.user.givenName = form.data.givenName;
        	    request.user.surname = form.data.surname;
        	    request.user.customData.streetAddress = form.data.streetAddress;
        	    request.user.customData.city = form.data.city;
        	    request.user.customData.state = form.data.city;
        	    request.user.customData.zip = form.data.zip;

        	    user.save(function(error){
        	    	if(error){
        	    		if(error.developerMessage){
        	    			console.error(error);
        	    		}
        	    		renderForm(request,response,{
                            errors : [{
                            	error : error.userMessage ||
                            	error.message || String(error)
                            }]
        	    		});
        	    	}else{
        	    		renderForm(request,response,{
        	    			saved:true
        	    		});
        	    	}

        	    });	
        	},
        	error : function(form){
        		renderForm(request,response,{
                    errors : collectFormErrors(form)
        		});
        	},
        	empty : function(){
        		renderForm(request,response);
        	}
        });
    });  

 
    router.use(function(error,request,response,nex){
          if(error.code =="EBADCSRFTOKEN"){
          	if(request.user){
          		renderForm(request,response,{
                    errors:[{error:'Expired.'}]
          		});
          	}else{
          		response.redirect('/');
          	}
          }else{
          	return next(error);
          }
    });

   return router ;
};




