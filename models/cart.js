const mongoose = require('mongoose');

let cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    items: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
            size: { String },
            color: { String },
            qty: { Number },
            price: { Number }
        }
    ]
});

module.exports = mongoose.model('cart', cartSchema);