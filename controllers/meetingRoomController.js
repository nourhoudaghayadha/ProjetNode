const MeetingRoom = require('../models/meetingRoom');
const defaultMeetingRooms = require('../defaultMeetingRooms');


exports.getAllMeetingRooms = async (req, res) => {
    try {
        // Fetch all meeting rooms from the database
        const meetingRooms = await MeetingRoom.find();

        // Send the meeting rooms as a response
        res.status(200).json(meetingRooms);
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error('Error fetching meeting rooms:', error);
        res.status(500).json({ error: 'An error occurred while fetching meeting rooms' });
    }
};

exports.createMeetingRoom = async (req, res) => {
    try {
        // Extract room details from the request body
        const { name, capacity, facilities } = req.body;

        // Create a new meeting room instance
        const newMeetingRoom = new MeetingRoom({
            name: name,
            capacity: capacity,
            facilities: facilities
        });

        // Save the new meeting room to the database
        await newMeetingRoom.save();

        // Respond with a success message and the created meeting room
        res.status(201).json({ message: 'Meeting room created successfully', meetingRoom: newMeetingRoom });
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error('Error creating meeting room:', error);
        res.status(500).json({ error: 'An error occurred while creating the meeting room' });
    }
};
