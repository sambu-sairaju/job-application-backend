const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend access
app.use(cors({
  origin: ["http://localhost:3000", "https://sambu-sairaju.github.io/Job-application-frontend/"], 
  credentials: true
}));

app.use(express.json());

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files (for resume access)
app.use("/uploads", express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files inside 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected 🚀"))
  .catch(err => console.error("MongoDB Connection Error:", err));

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
  resume: String, // Store filename for resume
  createdAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

// API Endpoint to Submit Job Application
app.post("/apply", upload.single("resume"), async (req, res) => {  // **Check field name: "resume"**
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
    res.status(201).json({ message: "Application submitted successfully!", resumePath: `/uploads/${req.file.filename}` });
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
