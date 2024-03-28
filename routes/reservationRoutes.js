const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Define the route handlers
router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);
router.get('/room/:roomId', reservationController.getReservationsByRoom);


module.exports = router;