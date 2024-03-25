const mongoose = require('mongoose');

const meetingRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: [String],
    // Autres champs et méthodes si nécessaire
});

module.exports = mongoose.model('MeetingRoom', meetingRoomSchema);
