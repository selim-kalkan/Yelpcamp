if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express=require("express");
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
  secret: 'yelpcampsecretkey',
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

// Set EJS as the view engine
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

// Routers
app.use(authRouter);
app.use(campgroundsRouter);
const a=async ()=>await User.find({});
const b=a().then(console.log(this.username));

app.listen(3000,()=>console.log("app listen to port=3000 address"))
