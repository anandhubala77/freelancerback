const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true, // Removes whitespace from both ends of a string
        minlength: 5,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 20,
        maxlength: 2000,
    },
    budget: {
        type: Number,
        required: true,
        min: 0, // Budget cannot be negative
    },
    skillsRequired: {
        type: [String], // Array of strings
        default: [],
    },
    timeline: {
        type: String,
        trim: true,
        maxlength: 100,
        default: 'Flexible',
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100,
        default: 'Remote',
    },
    datePosted: {
        type: Date,
        default: Date.now, // Automatically set to the current date/time when created
    },
    status: {
        type: String,
        enum: ['posted', 'active', 'completed', 'cancelled'], // Define allowed statuses
        default: 'posted',
    },
    // Fields for when a project is 'active' or 'completed'
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId, // Link to the User model (freelancer)
        ref: 'users',
        default: null, // Null initially, set when hired
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    completionDate: {
        type: Date,
        default: null,
    },

    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null,
      },
}, {
    timestamps: true


});
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;