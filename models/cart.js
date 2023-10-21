const mongoose = require('mongoose');

let cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        unique: true,
        required: true,
    },
    items: [
        {
            sku: { 
                type: String,
                required: true
            },
            size: String,
            color: String ,
            quantity: Number
        }
    ]
});

module.exports = mongoose.model('cart', cartSchema);