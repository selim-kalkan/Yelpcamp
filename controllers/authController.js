const passport = require('passport');
const User = require('../models/user');

exports.renderRegister = (req, res) => {
  res.render('users/register');
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Registration successful! Welcome to YelpCamp.');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
};

exports.renderLogin = (req, res) => {
  res.render('users/login');
};

exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/campgrounds');
};

exports.logout = (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login'); 
  });
};
