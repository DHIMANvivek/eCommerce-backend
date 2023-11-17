const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    firstname:{
        type: String,
        trim: true,
        required:true,
        lowercase: true
    },
    lastname:{
        type: String,
        trim: true,
        lowercase: true
    },
    apartment:{
        type: String,
        trim: true,
        required:true,
        lowercase: true
    },
    area:{
        type: String,
        trim: true,
        required:true,
        lowercase: true
    },
    landmark:{
        type: String,
        trim: true,
         required:true,
        lowercase: true
    },
    pincode: {
        type: Number,
        trim: true,
        required: ['true', "Please enter a valid pincode"]
    },
    city: {
        type: String,
        required: true,
        lowercase: true
    },
    town_city:{ 
        type: String,
        trim: true,
        required:true,
        lowercase: true
    },
    state: {
        type: String,
        trim: true,
        required:true,
        lowercase: true
    },
    country: {
        type: String,
        trim: true,
        lowercase: true,
        default: "India"
    },
    mobile: {
        type: Number,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
    
});