const Campground = require('../models/campground');
const Booking = require('../models/booking');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

// Force Maptiler to use the standard https module instead of native fetch.
// Native fetch ignores IPv4 fallback, which causes timeouts on some ISPs.
const https = require('https');
maptilerClient.config.fetch = (url, options) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                json: async () => JSON.parse(data)
            }));
        }).on('error', reject);
    });
};
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    campground.author = req.user._id;
    await campground.save();

    console.log(campground);
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;

    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    campground.images.push(...imgs);
    await campground.save();

    // ✅ FIXED: delete selected images
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } }
        });
    }

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
};

module.exports.renderBookForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/book', { campground });
};

module.exports.createBooking = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }

    // Mock payment processing logic here
    // We assume the payment is always successful for the mock integration
    const booking = new Booking({
        user: req.user._id,
        campground: campground._id,
        price: campground.price,
        paymentStatus: 'paid', // Hardcoding as paid for mock
        bookingDate: new Date()
    });

    await booking.save();
    
    req.flash('success', 'Successfully booked campground and processed payment!');
    res.redirect('/my-bookings');
};
