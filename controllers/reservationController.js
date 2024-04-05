
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');
const moment = require('moment');
const MeetingRoom = require('../models/meetingRoom');
const simulatedCurrentTime = moment.utc("2024-03-29T23:30:00.000Z");
const { v4: uuidv4 } = require('uuid');

const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendConfirmationEmail = async (userEmail, { roomId, date, startTime, endTime, confirmationLink }) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: userEmail,
        subject: 'Confirm Your Reservation',
        text: `You've initiated a reservation for Room ID: ${roomId} on ${date} from ${startTime} to ${endTime}. Please confirm this reservation by clicking on the link: ${confirmationLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

exports.createReservation = async (req, res) => {
    try {
        const userId = req.userId; // Assuming this is correctly set from the middleware
        const { roomId, date, startTime, endTime } = req.body;

        // It seems you've missed to define `startDateTime` and `endDateTime` before using them
        // Here's the fix:
        const startDateTime = moment(date + 'T' + startTime).toDate();
        const endDateTime = moment(date + 'T' + endTime).toDate();

        const confirmationToken = uuidv4(); // Generate a unique confirmation token

        // Early validations
        if (!req.user) {
            return res.status(403).json({ message: "Pas de request" });
        }
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: "Accès refusé. Seuls les users sont autorisés à créer des réservations." });
        }
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: "Date, startTime, and endTime are required." });
        }

        // ObjectId validations
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roomId)) {
            throw new Error('Invalid ObjectId.');
        }

        // Check for conflicting reservations (now using correctly defined `startDateTime` and `endDateTime`)
        const conflictingReservations = await checkForConflictingReservations(roomId, startDateTime, endDateTime);
        if (conflictingReservations.length > 0) {
            return res.status(400).json({ error: 'There are conflicting reservations for this room during the specified time period.' });
        }

        // Create a new reservation with combined datetime
        const newReservation = new Reservation({
            userId,
            roomId,
            startTime: startDateTime,
            endTime: endDateTime,
            confirmationToken,
            confirmed: false
        });
        await newReservation.save();

        // Save the reservation to the database
        const confirmationLink = `http://localhost:5000/reservation/confirm-reservation?token=${confirmationToken}`; // Adjust the domain as necessary
        await sendConfirmationEmail(req.user.email, { 
            roomId, 
            date, 
            startTime, 
            endTime, 
            confirmationLink 
        });
        console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD);

        res.status(200).json({ message: "Reservation initiated. Please check your email to confirm." });
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ error: 'An error occurred while creating the reservation.', message: error.message });
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


