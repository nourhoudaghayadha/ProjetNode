// Function to get IDs of available meeting rooms for the current date
exports.getAvailableMeetingRoomIds = async () => {
    try {
        const currentDate = moment().startOf('day');
        const reservations = await Reservation.find({
            startTime: { $gte: currentDate },
            endTime: { $lte: moment(currentDate).endOf('day') }
        });
        const reservedRoomIds = reservations.map(reservation => reservation.roomId);
        return reservedRoomIds;
    } catch (error) {
        throw new Error('Error fetching available meeting room IDs: ' + error.message);
    }
};
