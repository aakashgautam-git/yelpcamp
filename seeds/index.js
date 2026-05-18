const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const User = require('../models/user');

require('dotenv').config();

mongoose.set('strictQuery', true);

const dbUrl = process.env.MONGO_DB_URL || process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp-maptiler';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    const count = await Campground.countDocuments();
    if (count > 0) {
        console.log("Database already contains campgrounds! Seeding skipped to protect your manual data.");
        return;
    }
    
    // Find or create a default user to be the author
    let user = await User.findOne();
    if (!user) {
        try {
            user = new User({ email: 'admin@gmail.com', username: 'admin' });
            user = await User.register(user, 'admin');
        } catch (e) {
            console.log("Error creating user via register, trying direct save:", e.message);
            user = new User({ email: 'admin@gmail.com', username: 'admin' });
            await user.save();
        }
    }
    const authorId = user._id;

    const campImages = [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80'
    ];

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: authorId,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero labore accusantium laudantium sint ut vel. Dicta distinctio, corrupti, eveniet excepturi minus aspernatur, possimus provident sit quam eius error!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: sample(campImages),
                    filename: 'YelpCamp/placeholder',
                }
            ],
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Seeding complete, connection closed.");
});