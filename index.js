const multer = require("multer");
const path = require("path");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files inside 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage });

// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected 🚀"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    job_role: String,
    address: String,
    city: String,
    pincode: Number,
    date: Date,
    resume: String, // For now, store filename (need multer for file uploads)
    createdAt: { type: Date, default: Date.now }
  });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

// API Endpoint to Submit Job Application
app.post("/apply", upload.single("upload"), async (req, res) => {
    try {
      const newApplication = new JobApplication({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        job_role: req.body.job_role,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        date: req.body.date,
        resume: req.file ? req.file.filename : "", // Store uploaded file name
      });
  
      await newApplication.save();
      res.status(201).json({ message: "Application submitted successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  

// API Endpoint to Get All Applications
app.get("/applications", async (req, res) => {
  try {
    const applications = await JobApplication.find();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
