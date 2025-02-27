const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User");  // Import User Schema
const Form = require("./models/Form");  // Import Form Schema

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "your_jwt_secret";  // Change this to a secure key

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/formApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));


// 🔹 Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};


// 🔹 User Signup Route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
});


// 🔹 User Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
});


// 🔹 Create a Form (Admin Only)
app.post("/api/forms/create", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { formName, fields } = req.body;
    if (!formName || fields.length === 0) {
      return res.status(400).json({ error: "Form name and fields are required" });
    }

    const newForm = new Form({ adminId: req.user.userId, formName, fields });
    await newForm.save();

    res.status(201).json({ message: "Form created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error creating form" });
  }
});


// 🔹 Get All Forms Created by the Admin
app.get("/api/forms/admin-dashboard", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const forms = await Form.find({ adminId: req.user.userId });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching forms" });
  }
});


// 🔹 Submit a Form (Users)
app.post("/api/forms/submit/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const { data } = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    form.submissions.push({ data });
    await form.save();

    res.json({ message: "Form submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error submitting form" });
  }
});


// 🔹 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
