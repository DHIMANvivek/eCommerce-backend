const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        backgroundImage: {
            type: String,
            require: true,
        },
        title: {
            type: String,
            require: true,
        },
        subTitle: {
            type: String,
        },
        buttonText: {
            type: String,
            require: true,
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
        }
    }
)

module.exports = mongoose.model('banners', bannerSchema);