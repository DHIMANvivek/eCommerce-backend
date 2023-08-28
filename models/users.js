const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({ 
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        trim: true,
        default: '',
    },
    email:{
           type: String,
            trim: true,
            required: true,
            lowercase: true,
            unique: true
    },
    password: {
         type: String,
            required: true,
            minlength: 8
    },
     role: {
            type: String,
            enum: ['PURCHASER', 'SELLER'],
            default: 'PURCHASER'
        },
    active: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        autoIndex: true,
});

module.exports = mongoose.model('users', userSchema);