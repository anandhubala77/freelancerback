// models/userSchema.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true, // Email should be unique
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        enum: ['jobseeker', 'hiringperson', 'admin'],
        required: true
    },
    google: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    profile: { // Assuming this was for a profile picture URL, let's keep it.
        type: String,
    },
    // --- NEW FIELDS FOR PROFILE ---
    skills: {
        type: [String], // Array of strings for skills
        default: []
    },
    education: [{ // Array of education objects
        degree: { type: String },
        institution: { type: String },
        year: { type: String } // Or Number, depending on your preference
    }],
    experience: [{ // Array of experience objects
        title: { type: String },
        company: { type: String },
        startDate: { type: String }, // Or Date type if you want to handle dates
        endDate: { type: String },   // Or Date type
        description: { type: String }
    }]
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const users = mongoose.model('users', userSchema);
module.exports = users;