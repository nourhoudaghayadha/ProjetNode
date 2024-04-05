const User = require('../models/user');
const bcrypt = require('bcryptjs');
const createError = require('../utils/appError');

const jwt = require('jsonwebtoken');

// Register user
exports.signup = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            return next(new createError('User already exists!', 400));
        }

        // Directly pass the password to the User.create method
        const newUser = await User.create(req.body);

        // JWT 
// Dans les méthodes signup et login
const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
    expiresIn: '90d',
});


        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('Auth/login', { error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('Auth/login', { error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('Auth/login', { error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });
        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax' }); // For HTTP
        res.redirect('/home'); // Assurez-vous que cette route existe
    } catch (error) {
        console.error(error);
        res.status(500).render('Auth/login', { error: 'An error occurred during the login process' });
    }
};