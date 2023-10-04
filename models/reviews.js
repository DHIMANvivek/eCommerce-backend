const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            rating: {
                type: Number,
                min: 0,
                max: 5,
            },
            comment: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});