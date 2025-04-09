const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/BlogSy", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error Connecting to MongoDB", err));

// Blog Post Schema
const PostSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    BlogTitle: { type: String, required: true },
    Content: { type: String, required: true },
    type: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: "User", required: false },
    comments: [{
        date: { type: Date, default: Date.now },
        userName: { type: String, required: true },
        email: { type: String, required: true },
        comment: { type: String, required: true }
    }]
});

// User Schema
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPosts" }]
});

// OTP Schema for temporary storage
const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, expires: 600, default: Date.now }, // Expires in 10 minutes
});

// Models
const BlogPosts = mongoose.model("BlogPosts", PostSchema);
const User = mongoose.model("User", UserSchema);
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = { BlogPosts, User, OTP };


const travelBlogs = [
    {
        BlogTitle: "Exploring the Serenity of the Swiss Alps",
        Content: "The Swiss Alps offer a picturesque escape from the hustle of daily life. Towering peaks, pristine lakes, and charming alpine villages create a magical experience for nature lovers. The sound of cowbells echoes through the valleys, while the snow-capped peaks stand as a testament to nature's grandeur.\n\nVisitors can explore the scenic trails, enjoy winter sports, or simply relax in cozy chalets. Every turn reveals a postcard-worthy view, making it a paradise for photographers. Don't miss the opportunity to savor Swiss chocolate and cheese, adding a delightful culinary touch to your adventure.",
        type: "public",
        author: "67dd39abcc54deae229d3d1b"
    },
    {
        BlogTitle: "A Journey Through Kyoto’s Timeless Temples",
        Content: "Kyoto, the cultural heart of Japan, offers a mesmerizing blend of history and tradition. Walking through its ancient streets, you’ll find serene temples, vibrant gardens, and wooden tea houses. Kinkaku-ji, the Golden Pavilion, reflects beautifully in the pond that surrounds it, capturing the essence of Zen architecture.\n\nExploring Kyoto in autumn is especially enchanting as the maple leaves turn vivid shades of red and orange. The city’s traditional tea ceremonies provide an opportunity to experience Japanese culture in its purest form, making Kyoto a must-visit destination.",
        type: "public",
        author: "67da3945ead9693ea21bc076"
    },
    {
        BlogTitle: "Discovering the Magic of Santorini",
        Content: "With its iconic white-washed buildings and blue-domed churches, Santorini stands as a jewel of the Aegean Sea. The island’s sunsets are legendary, drawing visitors to Oia for breathtaking views. The caldera cliffs offer spectacular panoramas, while the sparkling waters below invite travelers for a refreshing swim.\n\nDon’t miss a boat tour to explore the volcanic islets, followed by a relaxing soak in the island’s hot springs. Culinary delights abound, with fresh seafood and local wines that perfectly complement the idyllic setting.",
        type: "public",
        author: "67dd39abcc54deae229d3d1b"
    },
    {
        BlogTitle: "An African Safari Adventure in Kenya",
        Content: "Experience the thrill of an African safari in Kenya’s Maasai Mara National Reserve. This vast savannah is home to majestic lions, graceful giraffes, and herds of elephants. The annual wildebeest migration is a breathtaking spectacle, drawing photographers and wildlife enthusiasts alike.\n\nStaying in luxurious tented camps allows you to connect with nature without sacrificing comfort. At night, the sky sparkles with countless stars, accompanied by the distant calls of the wild. A safari in Kenya is a once-in-a-lifetime experience that leaves visitors in awe.",
        type: "public",
        author: "67da3945ead9693ea21bc076"
    },
    {
        BlogTitle: "Sailing the Amalfi Coast",
        Content: "The Amalfi Coast in Italy is a captivating blend of colorful cliffside villages and the azure Mediterranean Sea. Sailing along the coast provides an unmatched perspective of this UNESCO World Heritage site. Each town has its own charm, from the bustling energy of Positano to the historic beauty of Amalfi.\n\nStop by local trattorias for authentic Italian cuisine, and sip limoncello crafted from the region’s fragrant lemons. The coastline’s dramatic views and romantic ambiance make it a perfect destination for couples and adventurers alike.",
        type: "anon",
        author: null
    },
    {
        BlogTitle: "Backpacking Through Patagonia",
        Content: "For those who crave adventure, Patagonia offers an unparalleled experience. Stretching across Argentina and Chile, this region boasts rugged mountains, crystal-clear lakes, and sprawling glaciers. Hikers can explore the famous Torres del Paine National Park, where granite peaks rise dramatically against the sky.\n\nCamping under the stars and witnessing the Milky Way in the unpolluted night sky is a magical experience. Patagonia’s remote beauty inspires awe and a sense of freedom, making it a bucket-list destination for outdoor enthusiasts.",
        type: "anon",
        author: null
    },
    {
        BlogTitle: "Experiencing the Northern Lights in Norway",
        Content: "Chasing the northern lights is a dream for many travelers, and Norway offers one of the best opportunities to witness this phenomenon. The Arctic landscapes provide the perfect backdrop as the night sky dances with vibrant green, purple, and blue hues.\n\nFor the best viewing experience, head to Tromsø or the Lofoten Islands between September and March. Cozy lodges and glass igloos offer comfortable accommodations, allowing you to gaze at the auroras from the warmth of your room.",
        type: "public",
        author: "67dd39abcc54deae229d3d1b"
    },
    {
        BlogTitle: "A Cultural Escape to Marrakech",
        Content: "Marrakech, Morocco, is a city of vibrant colors, rich aromas, and lively souks. Wandering through the bustling Medina, visitors are greeted by the sights of handcrafted goods, traditional lanterns, and intricate textiles. The city’s historic palaces and gardens offer a glimpse into Morocco’s regal past.\n\nSavor authentic Moroccan cuisine with fragrant tagines and freshly baked bread. In the evenings, the sounds of traditional music fill the air as the Jemaa el-Fnaa square comes alive with entertainers and food vendors.",
        type: "public",
        author: "67da3945ead9693ea21bc076"
    },
    {
        BlogTitle: "Road Tripping Along Australia’s Great Ocean Road",
        Content: "The Great Ocean Road is one of Australia’s most iconic drives, winding along the southeastern coast. The rugged coastline is adorned with limestone formations like the Twelve Apostles, which rise dramatically from the Southern Ocean.\n\nAlong the way, stop at charming seaside towns and take in the scenic views. Koalas and kangaroos are often spotted, adding to the road trip’s charm. This adventure is perfect for those seeking a blend of natural beauty and coastal exploration.",
        type: "anon",
        author: null
    }
];

// BlogPosts.insertMany(travelBlogs);
