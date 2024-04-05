const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // First check for the token in the request cookies
     const token = req.cookies.token;

     // If the token isn't present in cookies, respond with an error
     if (!token) {
         return res.status(401).json({ message: "Authentication token required." });
     }

    try {
        // Verify the token with your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user information to the request object
        req.user = decoded;
        req.userId = decoded.id; // Assuming the token was encoded with an `id` field

        // Call the next middleware function in the stack
        next();
    } catch (error) {
        // If token verification fails, return an error
        console.error('Error verifying token:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token." });
        } else {
            return res.status(401).json({ message: "Authentication failed." });
        }
    }
};

module.exports = authenticate;
