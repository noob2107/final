const express = require("express");
const app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var auth = require("./controllers/auth");
var store = require("./controllers/store");
var localStrategy = require("passport-local");

const User = require("./models/user");
const Book = require("./models/book");
const Bookcopy = require("./models/bookCopy");

require('dotenv/config')

//importing the middleware object to use its functions
var middleware = require("./middleware"); //no need of writing index.js as directory always calls index.js by default
var port = process.env.PORT || 3000;



// connnecting to mongooose   EXTERNAL
const dbURI = process.env.MONGOOSE_KEY
// mongoose.connect(dbURI , { useNewUrlParser:true, useUnifiedTopology:true })
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((result) => {
    console.log("connected to mongoose....")
    app.listen(port, () => {
      console.log(`App listening on port ${port}!`);
    })
  })

  .catch((err) => console.log(err))



app.use(express.static("public"));

/*  CONFIGURE WITH PASSPORT */
app.use(
  require("express-session")({
    secret: "decryptionkey", //This is the secret used to sign the session ID cookie.
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //middleware that initialises Passport.
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //used to authenticate User model with passport
passport.serializeUser(User.serializeUser()); //used to serialize the user for the session
passport.deserializeUser(User.deserializeUser()); // used to deserialize the user




app.use(express.urlencoded({ extended: true })); //parses incoming url encoded data from forms to json objects // get the form material
// app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

//THIS MIDDLEWARE ALLOWS US TO ACCESS THE LOGGED IN USER AS currentUser in all views
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/* TODO: CONNECT MONGOOSE WITH OUR MONGO DB  */

app.get("/", (req, res) => {
  res.render("index", { title: "Library" });
});

/*-----------------Store ROUTES
TODO: Your task is to complete below controllers in controllers/store.js
If you need to add any new route add it here and define its controller
controllers folder.
*/


app.get("/books", store.getAllBooks);    //all books done

app.get("/book/:id", store.getBook);    // single book done

app.get("/books/loaned", middleware.isLoggedIn,
  //TODO: call a function from middleware object to check if logged in (use the middleware object imported)
  store.getLoanedBooks);

app.post("/books/issue",middleware.isLoggedIn,
  //TODO: call a function from middleware object to check if logged in (use the middleware object imported)
  store.issueBook);

app.post("/books/search-book", store.searchBooks);          //done

/* TODO: WRITE VIEW TO RETURN AN ISSUED BOOK YOURSELF */

app.post("/books/loaned",  middleware.isLoggedIn, store.removeBooks);



/*-----------------AUTH ROUTES
TODO: Your task is to complete below controllers in controllers/auth.js
If you need to add any new route add it here and define its controller
controllers folder.
*/


app.get("/login", auth.getLogin);  //done

app.post("/login", auth.postLogin);   //done

app.get("/register", auth.getRegister);  //done

app.post("/register", auth.postRegister);   //done

app.get("/logout", auth.logout);     // check one more
