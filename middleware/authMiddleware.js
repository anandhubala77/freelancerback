// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authenticateToken = (req, res, next) => {
    // Get token from header (e.g., "Bearer YOUR_TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        // Verify token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");

        // Attach userId and role to the request object
        // Note: Your login token uses `userId`, so we'll use that here.
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }
};

// Optional: Middleware to check roles if you need specific roles for certain updates
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the necessary role to perform this action' });
        }
        next();
    };
};