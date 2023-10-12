const mongoose = require('mongoose');

const sellerSchema = mongoose.Schema({
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    categories: [{
        type: String,
        unique: true
    }],
    brands: [{
        type: String,
        unique: true
    }],
    sizes: [{
        type: String,
        unique: true
    }],
    tags: [{
        type: String,
        unique: true
    }],
    payment: {
        account_info: {
            bankName: {
                type: String,
                required: true
            },
            accountHolder: {
                type: String,
                required: true
            },
            accountNumber: {
                type: Number,
                required: true
            },
            IFSC: {
                type: String,
                required: true,
            }
        },
        GST: {
            type: String,
            required: true
        },

    }
},
    {
        timestamps: true,
        autoIndex: true
    });

module.exports = mongoose.model('sellerdetails', sellerSchema);