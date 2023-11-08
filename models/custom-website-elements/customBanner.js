const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        backgroundImage: {
            type: String,
            require: true,
        },
        title: {
            type: String,
        },
        subTitle: {
            type: String,
        },
        buttonText: {
            type: String,
        },
        buttonLink: {
            type: String,
            require: true,
        },
        contentAlign: {
            type: String,
            default : 'Left'
        },
        colors: {
            titleColor: {
                type: String,
            },
            subTitleColor: {
                type: String,
            },
            buttonColor: {
                type: String,
            }
        },
        active : {
            type: Boolean,
            default : true
        }
    }
)

module.exports = mongoose.model('banners', bannerSchema);