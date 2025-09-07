const express = require('express');
const passport = require('passport');
const { userValidate } = require('../middleware');
const authController = require('../controllers/authController');
const router = express.Router();

// Register route
router.get('/register', authController.renderRegister);
router.post('/register', userValidate, authController.register);

// Login route
router.get('/login', authController.renderLogin);
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), authController.login);

router.get('/logout', authController.logout);

module.exports = router;
