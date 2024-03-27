
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');

// Method to get all reservations
exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching reservations' });
    }
};

const checkForConflictingReservations = async (roomId, startTime, endTime) => {
    try {
        // Query the database to find any reservations for the given room and time range
        const conflictingReservations = await Reservation.find({
            roomId: roomId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Reservation starts or ends within the specified range
                { startTime: { $gte: startTime, $lt: endTime } }, // Reservation starts within the specified range
                { endTime: { $gt: startTime, $lte: endTime } } // Reservation ends within the specified range
            ]
        });

        return conflictingReservations;
    } catch (error) {
        throw new Error('Error checking for conflicting reservations: ' + error.message);
    }
};


exports.createReservation = async (req, res) => {
    try {
        // Récupérer les données de la requête
        const { userId, roomId, startTime, endTime } = req.body;

        // Vérifier que userId et roomId sont des ObjectId valides
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roomId)) {
            throw new Error('userId ou roomId n\'est pas un ObjectId valide.');
        }

        // Vérifier que startTime et endTime sont fournis
        if (!startTime || !endTime) {
            throw new Error('startTime et endTime sont requis.');
        }

        // Vérifier s'il y a des réservations en conflit
        const conflictingReservations = await checkForConflictingReservations(roomId, startTime, endTime);
        if (conflictingReservations.length > 0) {
            return res.status(400).json({ error: 'There are conflicting reservations for this room during the specified time period' });
        }

        // Créer une nouvelle réservation
        const newReservation = new Reservation({
            userId: userId,
            roomId: roomId,
            startTime: startTime,
            endTime: endTime,
            // Autres champs de réservation si nécessaire
        });

        // Enregistrer la réservation dans la base de données
        const savedReservation = await newReservation.save();
        console.log("Réservation créée avec succès :", savedReservation);

        // Répondre au client avec la nouvelle réservation créée
        res.status(201).json(savedReservation);
    } catch (error) {
        console.error("Erreur lors de la création de la réservation :", error);
        
        // Envoyer une réponse d'erreur détaillée au client
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la création de la réservation', message: error.message });
    }
};

exports.getReservationsByRoom = async (req, res) => {
    try {
        const roomId = req.params.roomId;

        // Query the database for reservations of the specified room
        const reservations = await Reservation.find({ roomId: roomId });

        // Return the reservations as a response
        res.status(200).json(reservations);
    } catch (error) {
        // Handle errors
        console.error("Error fetching reservations:", error);
        res.status(500).json({ error: 'An error occurred while fetching reservations' });
    }
};


