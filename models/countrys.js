const mongoose = require('mongoose');
const countrySchema = new mongoose.Schema({
  POSTAL_CODE: Number,
  COUNTRY: String,
  COUNTY: String,
  CITY: [String],
  STATE: String, 
});

countrySchema.index({ 'POSTAL_CODE': 1 });

module.exports = mongoose.model('country', countrySchema);