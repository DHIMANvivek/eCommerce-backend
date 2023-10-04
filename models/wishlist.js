const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
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
        }
    ]
});

module.exports = mongoose.model('wishlist', wishlistSchema);