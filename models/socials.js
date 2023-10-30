const mongoose = require('mongoose');

const socialsSchema = new mongoose.Schema({
    facebook: { String },
    whatsapp: { String },
    instagram: {
        link: { String },
        accountID: { String },
        accessToken: { String }
    }
});

module.exports = mongoose.model('Socials', socialsSchema);