const mongoose = require('mongoose');

const AdminKeysSchema = new mongoose.Schema({
    keys: [
        {
            adminId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            publicKey: {
                iv: {type: String},
                encryptedData: {type: String},
                key: {type: String},
                required: true,
                type: Object
            },
            privateKey: {
                iv: {type: String},
                encryptedData: {type: String},
                key: {type: String},
                required: true,
                type: Object
            },
            enable: {
                type: Boolean,
                default: false
            }
        }
    ],
    razorKey: [
        {
            adminId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            rzpIdKey: {
                iv: {type: String},
                encryptedData: {type: String},
                key: {type: String},
                required: true,
                type: Object
            },
            rzpSecretKey: {
                iv: {type: String},
                encryptedData: {type: String},
                key: {type: String},
                required: true,
                type: Object
            },
            enable: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = mongoose.model('PaymentKeys', AdminKeysSchema);
