const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticate = require('../middleware/authMiddleware');

// Define the route handlers
router.get('/getAll', reservationController.getAllReservations);
router.post('/',authenticate, reservationController.createReservation);
router.get('/room/:roomId', reservationController.getReservationsByRoom);
//router.get('/reserve', (req, res) => {
  //  res.render('reservation/reserver'); // Render the reservation form template
//});
router.get('/availableRooms',reservationController.getAvailableMeetingRooms);
//router.get('/active', reservationController.getActiveReservations);

module.exports = router;
