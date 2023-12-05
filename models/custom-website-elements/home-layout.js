const mongoose = require('mongoose');

let layoutSchema = new mongoose.Schema(
    {
        name: { 
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        }
    }
);

let homeLayoutSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
            lowercase: true
        },
        layout: [layoutSchema],
        active: {
            type: Boolean,
            required: true,
            default: false
        }
    }
);

module.exports = mongoose.model('home-layout', homeLayoutSchema);