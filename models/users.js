const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({

    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true
    },
    name: {
        firstname: {
            type: String,
            trim: true,
            default: '',
        },
        lastname: {
            type: String,
            trim: true,
            default: '',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    mobile: {
        type: Number,
        trim: true,
        minLength: [10],
        maxLength: [10]
    },
    info: {
        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },
        dob: {
            type: Date,
            required: true
        },
        address: {
            type: [{
                location: {
                    type: String,
                    trim: true,
                    lowercase: true
                },
                city: {
                    type: String,
                    trim: true,
                    lowercase: true
                },
                pincode: {
                    type: Number,
                    trim: true,
                    required: ['true', "Please enter a valid pincode"]
                },
                state: {
                    type: String,
                    trim: true,
                    lowercase: true
                },
                country: {
                    type: String,
                    trim: true,
                    lowercase: true,
                    default: "India"
                }
            }],
            validate:  {
                validator: function (address) {
                    return address.length <= 3;
                },
                message: 'You can only add a maximum of 3 addresses.'
            }
        }
        
    },
    photo: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },
    cart: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
            size: {String},
            color: {String},
            qty: {Number}, 
            price: {Number}
        }
    ],
    wishlist: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
        }
    ],
    notifications: [
        
    ],
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