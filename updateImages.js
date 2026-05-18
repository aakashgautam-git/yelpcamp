const mongoose = require('mongoose');
const Campground = require('./models/campground');
require('dotenv').config();

const dbUrl = process.env.MONGO_DB_URL || process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp-maptiler';

// Removed outer connect

const campImages = [
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496545672447-f699b50ce270?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532339142463-fd0a89797915?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1455763916899-e8b50eca9967?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517823382902-f2ecf97fb3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464547323744-4edd0cd0c746?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525811902-f2342640856e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1487730116645-74489c95b41b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476041800959-2f10d0505280?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506535995048-638aa1b62b77?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515444744559-7be63e1600de?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1499577555318-124baf4bb47f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516934524818-8f85f3964955?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1455496231601-e6195da1fbfc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500581276021-a4bbcd0050c5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1439396087961-98bc12c21176?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464207687429-750564f3ea2e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470246973918-29a5280a8f5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483381616603-bfdeaecabdc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
    'https://www.travelandleisure.com/thmb/Rt-RFnBJ0UWTgw8dmTxQ41lDRtc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-most-scenic-camping-denali-UPDATE-SCENICCAMPING0425-6c8f431abaf44906b2fb55d05b11a2e2.jpg'
];

const sample = array => array[Math.floor(Math.random() * array.length)];

const updateDB = async () => {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const campgrounds = await Campground.find({});
    for (let camp of campgrounds) {
        // Give each campground 1 or 2 random images
        const numImages = Math.floor(Math.random() * 2) + 1;
        const images = [];
        for (let i = 0; i < numImages; i++) {
            images.push({
                url: sample(campImages),
                filename: 'YelpCamp/placeholder'
            });
        }
        camp.images = images;
        await camp.save();
    }
    console.log(`Successfully updated ${campgrounds.length} campgrounds with beautiful unique images!`);
}

updateDB().then(() => {
    mongoose.connection.close();
});
