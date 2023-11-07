const mongoose = require('mongoose');

const dealsSchema = new mongoose.Schema(
    {
  
        productImage:{
            type:String,
        },
        Title: {
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
        buttonText:{
            type:String,
            required:true
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
            backgroundColor:{
                type:String
            }
        }
    }
)

module.exports = mongoose.model('deals', dealsSchema);