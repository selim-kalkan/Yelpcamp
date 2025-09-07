const Campground = require('../models/campground');
const Review = require('../models/review');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}).populate('author').populate('reviews').populate({path:'reviews',populate:{path:'author'}});
  res.render('campgrounds/index', { campgrounds });
};

exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

exports.create = async (req, res) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  campground.images.push(...req.files.map(f=>({url:f.path,filename:f.filename})));
  const geodata = await geoCoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  campground.geometry = geodata.body.features[0].geometry;
  await campground.save();
  req.flash('success', 'Campground created successfully!');
  res.redirect(`/campgrounds/${campground._id}`);
};

exports.show = async (req, res) => {
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
};

exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate('author')
    .populate('reviews')
    .populate({path:'reviews',populate:{path:'author'}});
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

exports.update = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  if (campground.author = req.user._id) {
    campground.set(req.body.campground);
    const geodata = await geoCoder.forwardGeocode({
      query: req.body.location,
      limit: 1
    }).send();
    campground.geometry = geodata.body.features[0].geometry;
    await campground.images.push(...req.files.map(f=>({url:f.path,filename:f.filename})));
    campground = campground.images.filter(img => !req.body.deleteImages.includes(img.filename));
    await campground.save();
    await cloudinary.api.delete_resources(req.body.deleteImages.forEach(filename =>`upload/${filename}`));
    res.redirect(`/campgrounds/${campground._id}`);
  }
};

exports.delete = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  await cloudinary.api.delete_resources(campground.images.forEach(filename =>`upload/${filename}`));
  campground.deleteOne();
  req.flash('success', 'Campground deleted successfully!');
  res.redirect('/campgrounds');
};
