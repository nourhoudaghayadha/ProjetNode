const mongoose = require('mongoose');

const meetingRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Référence à l'utilisateur qui a créé la salle
});

module.exports = mongoose.model('MeetingRoom', meetingRoomSchema);
