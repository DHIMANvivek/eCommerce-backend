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
                lowercase: true
            },
            products: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                },
            ]
        },{
            timestamps: true,
            autoIndex: true,
        }
    ],
    active : {
        type : Boolean,
        default: true
    }
},
    {
        timestamps: true,
        autoIndex: true,
    });

module.exports = mongoose.model('wishlist', wishlistSchema);
