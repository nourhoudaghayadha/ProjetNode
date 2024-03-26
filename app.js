const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const connectDB = require('../reservationsalle/Service/db'); 
const authRouter = require('../reservationsalle/routes/authRoutes');
const app = express();

  //partie aka middelwqres
  app.use(cors());
  app.use(express.json());

  //route
app.use('/api/auth',authRouter);

//hedhy db
connectDB() // Appelez la fonction connectDB
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(4000, () => {
      console.log(`Server listening on port 4000`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
  
  


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
