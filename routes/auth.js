const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const { userValidate } = require('../middleware');
const router = express.Router();

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', userValidate, async (req, res, next) => {
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
});

// Login route
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/campgrounds');
});

module.exports = router;
