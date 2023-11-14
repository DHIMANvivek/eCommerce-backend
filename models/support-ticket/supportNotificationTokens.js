const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
});

const tokenDetailSchema = new mongoose.Schema([{
  tokenDetail: [tokenSchema],
}]);

module.exports = mongoose.model('supportNotificationTokens', tokenDetailSchema);
