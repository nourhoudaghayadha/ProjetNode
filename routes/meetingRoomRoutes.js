const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');

const { getAllMeetingRooms, createMeetingRoom } = require('../controllers/meetingRoomController');


console.log('Defining GET /');
router.get('/', getAllMeetingRooms);

console.log('Defining POST /');
router.post('/', authenticate, createMeetingRoom);



module.exports = router;
