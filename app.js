if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express=require("express");
const engine = require('ejs-mate');
const mongoose=require("mongoose");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const authRouter = require("./routes/auth");
const campgroundsRouter = require("./routes/campgrounds");
const flash = require("connect-flash");
const app=express();

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Method override middleware
app.use(methodOverride('_method'));



// Passport configuration
app.use(passport.initialize());
app.use(passport.session());


// Flash middleware
app.use(flash());


// Set flash messages to locals for all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
// Set EJS as the view engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/YelpcampDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('connected to mongodb');
})
.catch((err) => {
  console.error('connection error:', err);
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home page route
app.get('/', (req, res) => {
  res.render('home');
});


// Routers
app.use(authRouter);
app.use(campgroundsRouter);

// Error handler route
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { err });
});

app.listen(3000,()=>console.log("app listen to port=3000 address"))
