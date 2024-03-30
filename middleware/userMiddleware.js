const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to extract userId from JWT token
function extractUserId(req, res, next) {
    // Get the token from the request headers or cookies or wherever it's sent
    const token = req.headers.authorization; // Assuming token is sent in the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token and extract the userId
    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        // Attach userId to the request object
        req.userId = decoded.id;
        next(); // Call next middleware or route handler
    });
}

module.exports = extractUserId;
