const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        // required: true,
    },
    wishlists: [
        {
            wishlistName: {
                type: String,
            },
            products: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                },
            ]
        },
    ]
});

module.exports = mongoose.model('wishlist', wishlistSchema);
