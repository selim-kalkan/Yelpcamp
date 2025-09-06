const express = require('express');
const Campground = require('../models/campground');
const { isLoggedIn, campgroundValidate } = require('../middleware');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Get all campgrounds
router.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  campgrounds.populate('author').populate('reviews').populate({path:'reviews',populate:{path:'author'}});
  res.render('campgrounds/index', { campgrounds });
});

// Show form to create new campground
router.get('/campgrounds/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// Create new campground
router.post('/campgrounds', isLoggedIn, campgroundValidate,upload.array("image"), async (req, res) => {
  const campground = new Campground(req.body);
  campground.author = req.user._id;
  campground.image = req.files.map(f=>({url:f.path,filename:f.filename}));
  await campground.save();
  req.flash('success', 'Campground created successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
});

// Show single campground
router.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('author');
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
});

// Show form to edit campground
router.get('/campgrounds/:id/edit', isLoggedIn, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
});

// Update campground
router.put('/campgrounds/:id', isLoggedIn, campgroundValidate, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  if (campground.author = req.user._id)
  {
    campground.set(req.body.campground);
    campground.imageUrls.push(...req.files.map(f=>({url:f.path,filename:f.filename}))); 
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    
};})

// Delete campground
router.delete('/campgrounds/:id', isLoggedIn, async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash('success', 'Campground deleted successfully!');
  res.redirect('/campgrounds');
});

module.exports = router;
