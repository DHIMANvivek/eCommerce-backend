const mongoose = require('mongoose');

const passwordSchema = mongoose.Schema({

    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },

},
    {
        timestamps: true,
        autoindex: true
    }
);
passwordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
module.exports = mongoose.model('forgetPassword', passwordSchema);