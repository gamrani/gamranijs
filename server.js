var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views','./views');	
app.set('view engine','jade');

app.use(stormpath.init(app,{

    expand: {
    	customData : true
    }
    
}));
app.get('/profile',stormpath.getUser,function(request,response){
    console.log('BEfore');
    response.render('profile');
});

console.log("expand");
app.get('/',stormpath.getUser,function(request,response){
    console.log('BEfore');
    response.render('home',{
        title:'welcome'
    });
    console.log('AFter');
});

app.on('stormpath.ready',function(){
   console.log('Stormpath Ready');
});

app.listen(8080);