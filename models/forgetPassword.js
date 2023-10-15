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
module.exports = mongoose.model('forgetPassword', passwordSchema);