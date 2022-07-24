const express=require("express");
const mysql=require("mysql");
const dotenv=require('dotenv');
const path=require('path');
//const Razorpay = require("razorpay");
const cookieParser=require('cookie-parser');
dotenv.config({path:'./.env'});
const app =express();
const exphbs  = require('express-handlebars');
const { options } = require("./routes/auth");
const PORT=process.env.PORT || 4000;
const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});


const publicDirectory=path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());

app.set('view engine','hbs');
//const exphbs = require('express-handlebars');


db.connect((error)=>
{
if(error){
    console.log(error)
}
else{
    console.log("MySQL Connected...")
}
})

function setup_helper(){
    Handlebars.registerHelper("def",options=>{
        Handlebars.registerPartial(options.hash.name,options.fn());
    })
}

//Define Routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(PORT,()=>{
    console.log(`server started on ${PORT}`);
});

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        script: ()=> {
            document.getElementById('button').addEventListener('click',
            function(){
              document.querySelector('.bg-modal').style.display='flex';

            }

            )

        document.querySelector('.close').addEventListener('click',
        function(){
          document.querySelector('.bg-modal').style.display='none';
        })
           },pay:()=>{

           }

    }
});
