const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    title: [{
        type: String,
        required: true,
    }],
    status: {
        type: [String], 
        default: [
                'pending',
                'open',
                'rejected',
                'resolved',
                'closed',
                'cancelled',
                'in-progress',
        ]
    }
});

module.exports = mongoose.model('TicketStatus', childSchema);