const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            // Log the secret and token for debugging purposes
            console.log('Secret from .env:', process.env.JWT_SECRET);
            console.log('Token received:', token);

            // Attempt to verify the token with the secret from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // For debugging
            req.user = decoded;
            req.userId = decoded.id; // Attach the user ID to the request object

            next();
        } catch (error) {
            // If an error occurs, log it and return a 401 status code with an error message
            console.log('Error verifying token:', error);
            if (error.name === 'JsonWebTokenError') {
                // Invalid token
                return res.status(401).json({ message: "Token invalide." });
            } else if (error.name === 'TokenExpiredError') {
                // Expired token
                return res.status(401).json({ message: "Token expiré." });
            } else {
                // Other token verification errors
                return res.status(401).json({ message: "Erreur lors de l'authentification du token." });
            }
        }
    } else {
        return res.status(401).json({ message: "Token d'authentification requis." });
    }
};

module.exports = authenticate;
