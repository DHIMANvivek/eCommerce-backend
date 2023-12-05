const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            // required: true,
        },
        wishlists: [
            {
                wishlistName: {
                    type: String,
                    lowercase: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                products: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'products',
                    },
                ],
            },
        ],
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        autoIndex: true,
    }
);


module.exports = mongoose.model('wishlist', wishlistSchema);
