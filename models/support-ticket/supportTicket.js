const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketStatus',
  }
});

const ticketSchema = new mongoose.Schema({
  ticketTypes: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Open'
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  TicketStatus: [childSchema],  
  notificationDetails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'supportNotificationTokens',
  }],
});

module.exports = mongoose.model('Ticket', ticketSchema);
