const mongoose = require('mongoose');

const leadSchema = mongoose.Schema({

    UserId:{
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

module.exports = mongoose.model('forgetPassword', leadSchema);