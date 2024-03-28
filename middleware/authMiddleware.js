const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded); // Ajoutez ceci pour voir les informations décodées du token
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }
    } else {
        return res.status(401).json({ message: "Token d'authentification requis." });
    }
    console.log('Authenticate middleware type:', typeof authenticate); // Should log 'function'

};

module.exports = authenticate;
