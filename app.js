const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
// Importez d'autres routes si nécessaire

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
// Utilisez d'autres routes ici

mongoose.connect('mongodb://localhost/meeting_room_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));
