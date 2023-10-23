const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    wishlists: [
        {
            wishlistName: {
                type: String,
                required: true
            },
            products: [
                {
                    productID: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'products',
                        required: true,
                    },
                }

            ]
        },
    ]
});

module.exports = mongoose.model('wishlist', wishlistSchema);
