const express = require('express');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { isLoggedIn, campgroundValidate, isOwner,  } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const router = express.Router();
const { cloudinary, upload } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });


// Get all campgrounds
router.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({}).populate('author').populate('reviews').populate({path:'reviews',populate:{path:'author'}});
  res.render('campgrounds/index', { campgrounds });
}));

// Show form to create new campground
router.get('/campgrounds/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// Create new campground
router.post('/campgrounds', isLoggedIn, campgroundValidate, upload.array("image"), catchAsync(async (req, res) => {
  const campground = new Campground(req.body.campground);
  
  campground.author = req.user._id;
  campground.images.push(...req.files.map(f=>({url:f.path,filename:f.filename})));
  geodata = await geoCoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  campground.geometry = geodata.body.features[0].geometry;
  await campground.save();
  req.flash('success', 'Campground created successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

// Show single campground
router.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate('author')
    .populate('reviews')
    .populate({path:'reviews',populate:{path:'author'}});
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.locals.currentUser = req.user;
  res.render('campgrounds/show', { campground });
}));

// Show form to edit campground
router.get('/campgrounds/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate('author')
    .populate('reviews')
    .populate({path:'reviews',populate:{path:'author'}});
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground, });
}));

// Update campground
router.put('/campgrounds/:id', isLoggedIn, campgroundValidate,upload.array("image"), catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  if (campground.author = req.user._id)
  {
    campground.set(req.body.campground);
    geodata = await geoCoder.forwardGeocode({
    query: req.body.location,
    limit: 1
  }).send();
    campground.geometry = geodata.body.features[0].geometry;
    await campground.images.push(...req.files.map(f=>({url:f.path,filename:f.filename}))); 
    campground = campground.images.filter(img => !req.body.deleteImages.includes(img.filename));
    await campground.save();
    await cloudinary.api.delete_resources(req.body.deleteImages.forEach(filename =>`upload/${filename}` ));
    res.redirect(`/campgrounds/${campground._id}`)
  }
}));

// Delete campground
router.delete('/campgrounds/:id', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  await cloudinary.api.delete_resources(campground.images.forEach(filename =>`upload/${filename}` ));
  campground.deleteOne();
  req.flash('success', 'Campground deleted successfully!');
  res.redirect('/campgrounds');
}));


// Create review for a campground
router.post('/campgrounds/:id/reviews', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Review added!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete review from a campground
router.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, isOwner, catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review deleted!');
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
