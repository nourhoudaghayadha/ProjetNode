
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
exports.findRoomsByDate = async (req, res) => {
    try {
        // Extracting the date, start time, and end time from the request body
        const { selectedDate, selectedTime, endTime } = req.body;

        // Check for missing input
        if (!selectedDate || !selectedTime || !endTime) {
            return res.status(400).send("All fields (date, start time, and end time) are required.");
        }

        // Combining the date with start and end times and converting to Moment.js objects
        const startDateTime = moment(`${selectedDate}T${selectedTime}`);
        const endDateTime = moment(`${selectedDate}T${endTime}`);

        // Validation of Moment.js objects
        if (!startDateTime.isValid() || !endDateTime.isValid()) {
            return res.status(400).send("Invalid date or time format.");
        }

        // Finding reservations that overlap with the desired meeting time
        const overlappingReservations = await Reservation.find({
            $or: [
                { startTime: { $lte: endDateTime.toDate() }, endTime: { $gte: startDateTime.toDate() } },
            ],
        });

        // Extracting the room IDs of these reservations
        const reservedRoomIds = overlappingReservations.map(reservation => reservation.roomId);

        // Finding rooms not in the list of reservedRoomIds
        const availableRooms = await MeetingRoom.find({
            _id: { $nin: reservedRoomIds }
        });

        // Responding with the available rooms
        // Adjust this according to whether you need to render a page or return JSON
   //     res.status(200).json({ availableRooms }); // For API response
        // For server-rendered page, use:
        res.render('meetingRoom/availableroom', { availableRooms: availableRooms });

    } catch (error) {
        console.error("Error finding available rooms by date:", error);
        res.status(500).send("An error occurred while finding available rooms.");
    }
};

// Method to get all available meeting rooms for the current time
exports.getAvailableMeetingRooms = async (req, res) => {
    try {
        const currentTime = moment.utc();
        const activeReservations = await fetchActiveReservations(currentTime);

        // Extract roomIds from active reservations
        const reservedRoomIds = activeReservations.map(reservation => reservation.roomId.toString());

        // Get all meeting rooms
        const allRoomObjects = await MeetingRoom.find();

        // Filter out rooms that are currently reserved
        const availableRooms = allRoomObjects.filter(room => !reservedRoomIds.includes(room._id.toString()));

        // Render the EJS template with the available rooms
        res.render('meetingRoom/availableroom', { availableRooms: availableRooms });
    } catch (error) {
        console.error("Error within getAvailableMeetingRooms:", error);
        res.status(500).send("Error loading the page");
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

// exports.showReservationForm = async (req, res) => {
//     try {
//         const roomId = req.params.roomId;
//         // Assuming the Room ID is valid and exists in your DB, fetch the room details
//         const room = await MeetingRoom.findById(roomId);

//         if (!room) {
//             return res.status(404).send("Room not found");
//         }

//         // Render the reservation form template with room details
//         res.render('reservation/form', { room });
//     } catch (error) {
//         console.error("Error showing reservation form:", error);
//         res.status(500).send("Error loading the reservation form.");
//     }
// };

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

