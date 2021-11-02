const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require('util');

const con = mysql.createConnection({
  host: process.env.HOST_SERVER_LOCAL,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  //database: "etudiandb",
  database: process.env.DATABASE
});


//--------------------------




//THE REGISTER
exports.register = (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  //const sql='SELECT email FROM todos WHERE email= ?';
  con.query('SELECT email FROM todos WHERE email= ?', [email],  async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return res.render("register", {
          message: "The email has been taken already",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Password do not match",
        });
      }

      //bcrypt hashing password
      let hashedPassword = await bcrypt.hash(password, 8);
      //console.log(hashedPassword);

      //insertion dans la table users
      con.query("INSERT INTO todos set ?", { name: name, email: email, password: hashedPassword },  (error, results) => {
          if (error) {
            console.log(error);
          } else {
            return res.render("register", {
              message: "User saved",
            });
          }
        })
    });
};




//--------------------------

//THE LOGIN
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("login", {
        message: 'Please provide an email and Password'
      })
    }

    //Query
    const sql='SELECT * FROM todos WHERE email = ?';
    con.query(sql,   [email],   async (error, result) => {
       console.log(result);
      if (!result || !(await bcrypt.compare(password, result[0].password))) {
         res.status(401).render("login", {
            message: "Email or Password is incorrect"
          });
        } else {
          const id = result[0].id;
          const token =jwt.sign({ id:id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          //console.log("The token is:" + token);
          const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true,
          };
          //set the cookies to the browser
          res.cookie('jwt', token, cookieOptions);
          //redircet the user to the main page
          res.status(200).redirect("/");
        }
      })
  } catch (error) {
    console.log("Afficher erreur:  "+error);
  }
};


//-------------------





//if the user is login
exports.isLoggedIn = async (req, res, next) => {
  //get the token and check it
  //console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      //verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
      //console.log(decoded);
      //check if the user still exists
      con.query('SELECT * FROM todos WHERE  id = ? ',[decoded.id], (error, result) =>   {
     
        //if(error) throw error;
          //console.log(result);
          //s'il n'y a pas de resultat
          if (!result) {
           
            return next();
          }
          req.user = result[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};


//the logout
exports.logout = (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  res.status(200).redirect("/");
};
