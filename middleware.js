// middleware.js
const Joi = require('joi');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Campground validation middleware
const campgroundSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  price: Joi.number().required(),
  imageUrl: Joi.string().uri().optional()
});

function campgroundValidate(req, res, next) {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
}

// User validation middleware
const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

function userValidate(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
}

module.exports = { isLoggedIn, campgroundValidate, userValidate };
