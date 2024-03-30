const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // Utilisez cette importation
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Nouvelle importation
const connectDB = require('./Service/db'); // Ajustez le chemin selon votre structure de projet
const dotenv = require('dotenv');
const app = express();
const expressLayouts = require('express-ejs-layouts')
const meetingroomRoutes = require('./routes/meetingRoomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();
const PORT = process.env.PORT || 3000; // Fournit une valeur par défaut au cas où PORT n'est pas défini

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // true permet de gérer les objets complexes
app.use(cookieParser()); // Ajoutez ceci pour la gestion des cookies

// Routes
app.use('/meetingroom', meetingroomRoutes);
app.use('/reservation', reservationRoutes);
app.use('/api/auth', authRoutes); // Utilisez la variable importée correctement


// Partie view
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public/css'));

app.get('/', (req, res) => {
  res.render('Auth/authentication'); // This should match the casing and path of your directory and file
});

// Connection à MongoDB et démarrage du serveur
connectDB().then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});
