const express = require('express');
const router = express.Router();
const meetingRoomController = require('../controllers/meetingRoomController');

router.get('/', meetingRoomController.getAllMeetingRooms);
router.post('/', meetingRoomController.createMeetingRoom);
// Ajoutez d'autres routes au besoin

module.exports = router;
