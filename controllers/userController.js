const users = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  console.log("inside the user controller");
  console.log(req.body);

  const { name, lastName, email, password, role } = req.body;
  try {
    const existingUser = await users.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json("Account already exists, please login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new users({
      name,
      lastName,
      email,
      password: hashedPassword,
      role,
      google: "",
      linkedin: "",
    });

    await newUser.save();
    return res.status(201).json("Register request received");
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json("Register request failed");
  }
};

// User login only
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("inside the user controller", email, password);

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      return res.status(406).json("Login failed due to invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(406).json("Login failed due to invalid email or password");
    }

    const token = jwt.sign(
      { userId: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    const safeUser = {
      _id: existingUser._id,
      name: existingUser.name,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
    };

    return res.status(200).json({
      user_data: safeUser,
      jwt_Token: token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json("Login failed");
  }
};

// Admin login only

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with role admin
    const admin = await users.findOne({ email, role: "admin" });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateUserProfile = async (req, res) => {
  // req.userId is set by the authenticateToken middleware
  const userId = req.userId;
  const { name, lastName, email, skills, education, experience } = req.body;

  try {
    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields if provided in the request body
    if (name !== undefined) user.name = name;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email; // Be cautious with email updates (e.g., unique check)
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;

    // Optionally, handle profile picture URL update here if needed
    // if (profile !== undefined) user.profile = profile;

    await user.save(); // Save the updated user document

    // Respond with the updated safe user data
    const safeUser = {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      skills: user.skills,
      education: user.education,
      experience: user.experience,
      profile: user.profile, // Include profile URL if relevant
      // Exclude sensitive data like password
    };

    return res.status(200).json({
      message: 'Profile updated successfully!',
      user_data: safeUser,
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.code === 11000) { // Duplicate key error (e.g., if email is unique and already exists)
      return res.status(400).json({ message: 'Email already in use.' });
    }
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// You might also want a controller to fetch a user's *own* profile
exports.getLoggedInUserProfile = async (req, res) => {
  const userId = req.userId; // From auth middleware

  try {
    const user = await users.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({ user_data: user });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};

exports.getJobSeekerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== "jobseeker") {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.reportJobSeeker = async (req, res) => {
  try {
    const user = await users.findById(req.params.id);
    if (!user || user.role !== "jobseeker")
      return res.status(404).json({ message: "Job seeker not found" });

    user.reportedBy.push({
      reporterId: req.userId,
      reason: req.body.reason
    });

    await user.save();
    res.status(200).json({ message: "Job seeker reported as spam" });
  } catch (err) {
    res.status(500).json({ message: "Error reporting user", error: err });
  }
};

