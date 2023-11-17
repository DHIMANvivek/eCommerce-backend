const mongoose = require('mongoose');

const socialsSchema = new mongoose.Schema({
    logos: {
        desktop: {
            type: String,
            trim: true
        },
        mobile: {
            type: String,
            trim: true
        }
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    },
    mobile: {
        type: String,
        match: /^\+[1-9]\d{1,14}$/
    },
    address: {
        type: String,
        trim: true
    },
    facebook: { 
        type: String
     },
    whatsapp: {
        type: String,
        match: /^\+[1-9]\d{1,14}$/
    },
    instagram: {
        link: { 
            type: String
         },
        accountID: { 
            type: String
         },
        accessToken: { 
            type: String
         }
    }
});

module.exports = mongoose.model('Socials', socialsSchema);