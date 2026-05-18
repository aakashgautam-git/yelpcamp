const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validatedCampground } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const multer = require('multer');
const { storage } = require('../cloudinary');

const upload = multer({ storage });
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validatedCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatedCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.route('/:id/book')
    .get(isLoggedIn, catchAsync(campgrounds.renderBookForm))
    .post(isLoggedIn, catchAsync(campgrounds.createBooking));

module.exports = router
