const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('../reservationsalle/Service/db'); 
const authRouter = require('../reservationsalle/routes/authRoutes');
const dotenv = require('dotenv');
const app = express();
const expressLayouts = require('express-ejs-layouts')
const meetingroomRoutes = require('./routes/meetingRoomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// Routes
app.use('/meetingroom', meetingroomRoutes);
app.use('/reservation', reservationRoutes);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
});

//partie view
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/css',express.static(__dirname+'public/css'))


app.get('',(req,res)=>{
  res.render('Auth/authentification')
})

// Appel de la fonction connectDB et démarrage du serveur
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

module.exports = app;
