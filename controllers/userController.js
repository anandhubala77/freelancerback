const users = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// ----------------------------- Register User -----------------------------
exports.registerUser = async (req, res) => {
  const { name, lastName, email, password, role } = req.body;
  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Account already exists, please login" });
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
    return res.status(201).json({ message: "Register successful" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Register request failed" });
  }
};

// ----------------------------- Login User -----------------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
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
      message: "Login successful",
      jwt_Token: token,
      user_data: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ----------------------------- Login Admin -----------------------------
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await users.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    const safeAdmin = {
      _id: admin._id,
      email: admin.email,
      role: admin.role,
    };

    res.status(200).json({
      message: "Admin login successful",
      jwt_Token: token,
      user_data: safeAdmin,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------- Update Profile -----------------------------
exports.updateUserProfile = async (req, res) => {
  const userId = req.userId;
  const {
    name,
    lastName,
    email,
    skills,
    education,
    experience,
    profileimg,
    companyName,
    companyDescription,
    position,
  } = req.body;

  try {
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update common fields
    if (name !== undefined) user.name = name;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;
    if (profileimg !== undefined) user.profileimg = profileimg;

    // Hiring person specific
    if (user.role === "hiringperson") {
      if (companyName !== undefined) user.companyName = companyName;
      if (companyDescription !== undefined) user.companyDescription = companyDescription;
      if (position !== undefined) user.position = position;
    }

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      skills: user.skills,
      education: user.education,
      experience: user.experience,
      profileimg: user.profileimg,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      position: user.position,
    };

    return res.status(200).json({
      message: "Profile updated successfully!",
      user_data: safeUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use." });
    }
    return res.status(500).json({ message: "Failed to update profile." });
  }
};

// ----------------------------- Get Own Profile -----------------------------
exports.getLoggedInUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await users.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User profile not found." });
    }
    return res.status(200).json({ user_data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Failed to fetch user profile." });
  }
};

// ----------------------------- Get Job Seeker by ID -----------------------------
exports.getJobSeekerById = async (req, res) => {
  try {
    const user = await users.findById(req.params.id).select("-password");
    if (!user || user.role !== "jobseeker") {
      return res.status(404).json({ message: "Job seeker not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------- Report Job Seeker -----------------------------
exports.reportJobSeeker = async (req, res) => {
  try {
    const user = await users.findById(req.params.id);
    if (!user || user.role !== "jobseeker") {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    user.reportedBy.push({
      reporterId: req.userId,
      reason: req.body.reason,
    });

    await user.save();
    res.status(200).json({ message: "Job seeker reported as spam" });
  } catch (err) {
    res.status(500).json({ message: "Error reporting user", error: err });
  }
};

// ----------------------------- Update Password -----------------------------
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error while updating password" });
  }
};
