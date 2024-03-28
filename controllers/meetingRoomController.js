const MeetingRoom = require('../models/meetingRoom');

// Créer une salle de réunion (réservé aux administrateurs)
exports.createMeetingRoom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé. Seuls les administrateurs sont autorisés à créer des salles de réunion." });
        }


        const { name, capacity, facilities } = req.body;
        const newMeetingRoom = new MeetingRoom({
            name: name,
            capacity: capacity,
            facilities: facilities,
            createdBy: req.user._id // Enregistrer l'ID de l'administrateur qui crée la salle
        });

        await newMeetingRoom.save();
        res.status(201).json({ message: 'Salle de réunion créée avec succès', meetingRoom: newMeetingRoom });
    } catch (error) {
        console.error('Erreur lors de la création de la salle de réunion:', error);
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la création de la salle de réunion' });
    }

};

// Obtenir toutes les salles de réunion (accessible à tous les utilisateurs)
exports.getAllMeetingRooms = async (req, res) => {
    try {
        const meetingRooms = await MeetingRoom.find();
        res.status(200).json(meetingRooms);
    } catch (error) {
        console.error('Erreur lors de la récupération des salles de réunion:', error);
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des salles de réunion' });
    }
};
