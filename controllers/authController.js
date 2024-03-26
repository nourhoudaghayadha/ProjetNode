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
        const token = jwt.sign({ id: newUser._id }, 'secretkey123', {
            expiresIn: '90d',
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
        });

    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body; // Extract email and password from body

        if (!email || !password) {
            return next(new createError('Email and password are required', 400));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(new createError('User not found', 404));
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password); // Ensure user.password is the hashed password

        if (!isPasswordValid) {
            return next(new createError('Invalid email or password', 401));
        }


        const token = jwt.sign({ id: user._id }, 'secretkey123', {
            expiresIn: '90d',
        });

        res.status(200).json({
            status: 'success',
            token,
            message: 'Logged in successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        next(error);
    }
};
