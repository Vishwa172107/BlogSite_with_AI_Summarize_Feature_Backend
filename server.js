require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { BlogPosts, User, OTP } = require("./mongo"); // Import models
const axios = require("axios")

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        callback(null, origin)
    },
    credentials: true,
}));
// app.use(cors())
app.use(express.json());

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
    // console.log(`req: ${req.header}, res: ${res}, next:${next}`)
    const token = req.header("Authorization")?.split(" ")[1];
    console.log(token)
    if (!token) return res.status(401).json({ error: "Access Denied" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
};

app.get("/", (req, res) => {
    res.send("Hello World!")
})

// ======== Authentication Routes ========



// Configure nodemailer transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "vishwabadrinadh.padala@gmail.com", // Your email
        pass: process.env.EMAIL_PASS || "wkksiilesbzfypkg", // Your app password (from Google security settings)
    },
});

// ======== Authentication Routes ========

// Send OTP for Signup
app.post("/auth/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpEntry = new OTP({ email, otp, createdAt: Date.now() });
        await otpEntry.save();
        console.log(otp, email)

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for BlogSy Signup",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        };
        // console.log(transporter)
        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP", error);
        res.status(500).json({ error: "Error sending OTP" });
    }
});

// Verify OTP and register user
app.post("/auth/signup", async (req, res) => {
    try {
        console.log(req.body)
        const { firstName, lastName, userName, email, password, otp } = req.body.form;
        console.log({ firstName, lastName, userName, email, password, otp });


        const otpRecord = await OTP.findOne({ email: email, otp: otp });
        if (!otpRecord) return res.status(400).json({ error: "Invalid or expired OTP" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, userName, email, password: hashedPassword });
        await newUser.save();

        // Delete OTP after successful signup
        await OTP.deleteOne({ email });

        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating user" });
    }
});

// User Login
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, userName: user.userName, email: user.email }, JWT_SECRET, { expiresIn: "5h" });
        console.log(token);

        res.json({ token: token, UserId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
});

// ======== User Routes ========

// Get user profile
app.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password").populate("posts");
        if (!user) return res.status(404).json({ error: "User not found" });
        // console.log(user)
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user profile" });
    }
});

// Follow a user
app.post("/user/:id/follow", verifyToken, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.userId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent users from following themselves
        if (userToFollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        // Check if the user is already followed
        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save();
            await userToFollow.save();
            return res.json({ message: "Followed user successfully" });
        } else {
            return res.status(400).json({ error: "User is already followed" });
        }
    } catch (error) {
        console.error("Error in follow route:", error);
        res.status(500).json({ error: "Error following user" });
    }
});

// Unfollow User
app.post("/user/:id/unfollow", verifyToken, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.userId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent users from unfollowing themselves
        if (userToUnfollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ error: "You cannot unfollow yourself" });
        }

        // Check if the user is actually following before unfollowing
        if (currentUser.following.includes(userToUnfollow._id)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
            userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

            await currentUser.save();
            await userToUnfollow.save();
            return res.json({ message: "Unfollowed user successfully" });
        } else {
            return res.status(400).json({ error: "You are not following this user" });
        }
    } catch (error) {
        console.error("Error in unfollow route:", error);
        res.status(500).json({ error: "Error unfollowing user" });
    }
});

// ======== Blog Routes (Protected) ========

// Get all blog posts
app.get("/get-posts", verifyToken, async (req, res) => {
    try {
        const posts = await BlogPosts.find().populate("comments");
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Error fetching posts" });
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const post = await BlogPosts.findById(req.params.id).populate("comments");
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching post" });
    }
})

// Create a new blog post
app.post("/form/new-blog", verifyToken, async (req, res) => {
    try {
        const { title, content, type } = req.body;
        if (type === "anon") {
            const post = new BlogPosts({ BlogTitle: title, Content: content, type: type });
            await post.save();
        }
        else {
            const post = new BlogPosts({ BlogTitle: title, Content: content, type: type, author: req.user.userId })
            await post.save();
            const user = await User.findById(req.user.userId)
            user.posts.push(post)
            await user.save();
            user.followers?.forEach(async (follower) => {
                const userToNotify = await User.findById(follower)
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userToNotify.email,
                    subject: `A new Post  has been uploaded by ${user.userName}`,
                    html: `
  <p>Check out the new post by <strong>${user.userName}</strong> about <strong>${post.BlogTitle}</strong>.</p>
  <a href="http://localhost:5174/posts/${post._id}" 
     style="display:inline-block;padding:10px 15px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
     View Post
  </a>
`

                };
                // console.log(transporter)
                await transporter.sendMail(mailOptions);
            })
        }

        res.json({ message: "Blog post created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating blog post" });
    }
});

// Summarization API
app.post("/summarize", verifyToken, async (req, res) => {
    try {
        console.log(req.body)
        if (!req.body.text) return res.status(400).json({ error: "No text provided" });

        const summary = await axios.post(process.env.SUMMARIZATION_API, { text: req.body.text });
        res.json(summary.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing request" });
    }
});

app.post("/summary", async (req, res) => {
    try {
        console.log(req.body.text)
        if (!req.body.text) return res.status(400).json({ error: "No text provided" });

        const summary = await axios.post(process.env.SUMMARIZATION_API, { text: req.body.text });
        res.json(summary.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing request" });
    }
});

// Add a comment
app.post("/:postId/comment", verifyToken, async (req, res) => {
    try {
        const post = await BlogPosts.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = { date: new Date(), userName: req.user.userName, email: req.user.email, comment: req.body.comment };

        post.comments.push(comment);
        await post.save();

        res.json({ message: "Comment added successfully" });
    } catch (error) {
        console.error("Error adding comment", error);
        res.status(500).json({ error: "Error adding comment" });
    }
});

// Start Server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
