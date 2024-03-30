const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors middleware

const authRoutes = require('./routes/authRoutes');
const meetingroomRoutes = require('./routes/meetingRoomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();

const app = express();

// Use middleware
app.use(cors()); // Enable CORS
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/meetingroom', meetingroomRoutes);
app.use('/reservation', reservationRoutes);
app.use('/style', express.static(__dirname + '/Style'));
app.set('view engine', 'ejs');
// Import other routes if necessary


// Define route for the root path ("/")
app.get('/', (req, res) => {
    res.render('home'); // Render the "home" EJS template
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Global error handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

module.exports = app;
