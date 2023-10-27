// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { ref: 'users', type: mongoose.Schema.Types.ObjectId },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
