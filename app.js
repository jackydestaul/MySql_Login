
const express=require("express");
const path=require("path");
const exphbs=require('express-handlebars');
const mysql = require("mysql");
const dotenv=require("dotenv");
const cookieParser=require("cookie-Parser");


dotenv.config({path:'./.env'});


const app= express();


const con = mysql.createConnection({
  host: process.env.HOST_SERVER_LOCAL,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  //database: "etudiandb",
  database: process.env.DATABASE,
});

const publicDirectory=path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//parse URL-encodeded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended:false}));

//parse JSON bodies (as sent by API Clients)
app.use(express.json());

//cookie-parsers
app.use(cookieParser());

//handlebars engine is available
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');


//connect to the MySQL server
   con.connect((err) =>{
    if (err) {
      console.log('Affiche Erreur:' +err.message);
    }else{console.log('MySql Connected...');}
    
  });
//define routes for
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));








app.listen(4000);
console.log('server 4000');


