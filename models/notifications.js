const mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
  notification: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  },
  registration_ids: [{
    type: String,
    // required: true,
    trim: true
  }],
  state: {
    type: Boolean,
    default: true
  }
},
{
  autoIndex: true,
  timestamps: true
});

module.exports = mongoose.model('notifications', notificationSchema);
