
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');
const moment = require('moment');
const MeetingRoom = require('../models/meetingRoom');
const simulatedCurrentTime = moment.utc("2024-03-29T23:30:00.000Z");


const fetchActiveReservations = async (currentTime) => {
    return await Reservation.find({
        startTime: { $lte: currentTime.toDate() },
        endTime: { $gt: currentTime.toDate() }
    });
};

// Method to get all available meeting rooms for the current time
exports.getAvailableMeetingRooms = async (req, res) => {
    try {
        const currentTime = moment.utc();
        const activeReservations = await fetchActiveReservations(currentTime);
        console.log("Active Reservations:", activeReservations);

        // Extract roomIds from active reservations
        const reservedRoomIds = activeReservations.map(reservation => reservation.roomId.toString());
        console.log("Reserved Room IDs:", reservedRoomIds);

        // Get all meeting rooms
        const allRoomObjects = await MeetingRoom.find();
console.log("All room objects:", allRoomObjects);
const allRoomIds = allRoomObjects.map(room => room._id.toString()); // Convert all _id fields to strings.
console.log("All room IDs:", allRoomIds);

// Filter out rooms that are currently reserved.
// Use allRoomIds for the comparison, as it's an array of strings now.
const availableRooms = allRoomObjects.filter(room => !reservedRoomIds.includes(room._id.toString()));
console.log("Available rooms:", availableRooms);

        // Return the available meeting rooms
        // This should be the only response sent back from this route
        return res.status(200).json(availableRooms);
    } catch (error) {
        console.error("Error within getAvailableMeetingRooms:", error);
        return res.status(500).json({ error: 'An error occurred while fetching available meeting rooms' });
    }
};





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
        // userId is now available in req object due to the middleware
        const userId = req.userId;

        // Retrieve other data from the request body
        const { roomId, startTime, endTime } = req.body;

        // Check if userId, roomId, startTime, and endTime are valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('userId is not a valid ObjectId.');
        }

        // Check if roomId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            throw new Error('roomId is not a valid ObjectId.');
        }
        if (!startTime || !endTime) {
            throw new Error('startTime and endTime are required.');
        }

        // Check for conflicting reservations
        const conflictingReservations = await checkForConflictingReservations(roomId, startTime, endTime);
        if (conflictingReservations.length > 0) {
            return res.status(400).json({ error: 'There are conflicting reservations for this room during the specified time period' });
        }

        // Create a new reservation with userId
        const newReservation = new Reservation({
            userId: userId, // Set userId to the userId extracted from the token
            roomId: roomId,
            startTime: startTime,
            endTime: endTime,
            // Other reservation fields if necessary
        });

        // Save the reservation to the database
        const savedReservation = await newReservation.save();

        // Respond with the newly created reservation
        res.status(201).json(savedReservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ error: 'An error occurred while creating the reservation', message: error.message });
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
// Refactored to be used internally, returns active reservations
//const getActiveReservations = async (simulatedCurrentTime = moment.utc()) => {
  //  try {
        // Find active reservations
   //     const activeReservations = await Reservation.find({
   //         startTime: { $lte: simulatedCurrentTime.toDate() },
   //         endTime: { $gt: simulatedCurrentTime.toDate() }
   //     });

   //     return activeReservations; // Return the active reservations data
  //  } catch (error) {
  //      console.error("Error fetching active reservations:", error);
  //      throw new Error('An error occurred while fetching active reservations');
  //  }
//};

