const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticate = require('../middleware/authMiddleware');

// Define the route handlers
router.get('/getAll', reservationController.getAllReservations);
//router.post('/create',authenticate, reservationController.createReservation);
router.post('/create', authenticate,reservationController.createReservation);
router.get('/room/:roomId', reservationController.getReservationsByRoom);
router.get('/reserver/:roomId', (req, res) => {
  // Assuming you do some operation with req.params.roomId
  res.render('reservation/reserver', { roomId: req.params.roomId });
});


router.get('/availableRooms', reservationController.getAvailableMeetingRooms);
//router.get('/active', reservationController.getActiveReservations);
// Assuming you have a selectDate.ejs that contains the form for date input
router.get('/reserve/select-date', (req, res) => {
  res.render('reservation/selectDate');
});
// This requires a new or modified method in your controller
router.post('/reserve/by-date',authenticate, reservationController.findRoomsByDate);
router.get('/confirm-reservation', async (req, res) => {
  const { token } = req.query;

  try {
      const reservation = await Reservation.findOne({ confirmationToken: token });
      if (!reservation) {
          return res.status(404).render('errorPage', { message: "Reservation not found or already confirmed." });
      }
    
      reservation.confirmed = true;
      await reservation.save();
    
      res.render('reservation/confirmationSuccess'); // Assume you have this EJS template for successful confirmation
  } catch (error) {
      console.error("Error confirming reservation:", error);
      res.status(500).render('errorPage', { message: "An error occurred during confirmation." });
  }
});


module.exports = router;
