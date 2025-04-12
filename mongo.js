const mongoose = require("mongoose");
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
