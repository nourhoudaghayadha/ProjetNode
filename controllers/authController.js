const User = require('../models/user');
const bcrypt = require('bcryptjs');
const createError = require('../utils/appError');
const jwt = require('jsonwebtoken');

// Register user
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Vérification si l'utilisateur existe déjà
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists!' });
        }
       
        // Création d'un nouvel utilisateur
        const newUser = new User({
            name: name,
            email: email,
            password: password
        });

        await newUser.save();

        // Création du token JWT
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: '90d'
        });

        // Réponse avec les informations de l'utilisateur et le token
        res.status(201).json({
            status: 'success',
            token: token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.status(500).json({ message: 'Error signing up the user.' });
    }
};// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('Auth/authentification', { error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('Auth/authentification', { error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('Auth/authentification', { error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/meetingroom'); // Assurez-vous que cette route existe
    } catch (error) {
        console.error(error);
        res.status(500).render('Auth/authentification', { error: 'An error occurred during the login process' });
    }
};
