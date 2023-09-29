const mongoose = require('mongoose');
let notificationSchema = new mongoose.Schema({
    image: {
        type: String
    },
    heading: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    state:{
        type: Boolean,
        default: true
    }

},
{
    autoIndex: true,
    timestamps: true
}
);

module.exports = mongoose.model('notifications', notificationSchema);