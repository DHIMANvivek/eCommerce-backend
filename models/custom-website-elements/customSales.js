const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema(
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
        colors: {
            titleColor: {
                type: String,
            },
            subTitleColor: {
                type: String,
            },
            buttonColor: {
                type: String,
            },
            cardColor: {
                type: String,
            }
        },
        enable: {
            type: Boolean,
            default: false 
          }
    }
)

module.exports = mongoose.model('Sales', salesSchema);