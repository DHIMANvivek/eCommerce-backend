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
                type: String,
                required: true
            },
            privateKey: {
                type: String,
                required: true
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
                type: String,
                required: true
            },
            rzpSecretKey: {
                type: String,
                required: true
            },
            enable: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = mongoose.model('PaymentKeys', AdminKeysSchema);
