const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/adminSchema");
require("dotenv").config(); // Ensure env file is loaded

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ MongoDB connected");

    const existing = await Admin.findOne({});
    if (existing) {
      console.log("⚠️ Admin already exists");
      return process.exit(); // Exit early
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new Admin({
      email: "admin@gmail.com",
      password: hashedPassword
    });

    await admin.save();
    console.log("✅ Admin seeded");

    process.exit(); // End script
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
};

connectDB();
