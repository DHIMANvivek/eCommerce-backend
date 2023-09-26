const mongoose = require('mongoose');

const sellerSchema = mongoose.Schema({
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    organization: {
        type: String
    },
    categories: [{
        type: String
    }],
    brands: [{
        type: String
    }],
    size: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    colors: [{
        name:{
            type: String
        },
        hexCode: {
            type: String
        }
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
        TIN: {
            type: String
        }
    }
},
    {
        timestamps: true,
        autoIndex: true
    });

module.export = mongoose.model('sellerDetails', sellerSchema)
