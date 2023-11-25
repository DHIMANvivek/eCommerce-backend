const { off } = require("./address");
const products = require("./products");
const mongoose = require('mongoose');

let offerSchema = mongoose.Schema({

    OfferType: {
        type: String,
        required: true,
        enum: ['coupon', 'discount']
    },

    Image:{
        type:String
    },

    couponcode: {
        type: String,
        required:   function validate() {
                if (this.OfferType == 'coupon') return true;
            },
        
        unique:function validate() {
            if (this.OfferType == 'coupon') return true;
        },
    },

    Title: {
        type: String,
        required: true
    },


    Description: {
        type: String,
        required:true
    },


    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },

    // DiscountPercentageType:{
    //     type:String,
    //     // enum:['fixed','variable'],
    //     required:function validate() {
    //         if (this.discountType == 'percentage') return true;

    //     }
    // },

    discountAmount: {
        type: Number,
        min:0,
        required:true,
        validate: {
            validator: function() {
                if (this.discountType === 'percentage') {
                    return this.discountAmount >= 0 && this.discountAmount <= 100;
                }
                return true;
            },
            message: 'Invalid discount amount for the selected discount type'
        }
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true
    },

    maximumDiscount: {
        type: Number,
        // required: true,
        min:0
    },
    minimumPurchaseAmount: {
        type: Number,
        required: function validate() {
            if (this.OfferType == 'coupon') return true;

        },
        min:0
    },

    ExtraInfo:{
    //    type: Object,
    //     lowercase: true 
    categories:[{type:String,lowercase:true}],
    brands:[{type:String,lowercase:true}]    
    },


    couponType: {
        type: String,
        enum: ['global', 'custom','new'],
        required:function validate(){
            return (this.OfferType == 'coupon');
        },
        
    },
    userUsed:[
        {
        ref:'users',
        type: mongoose.Schema.Types.ObjectId,
    }
    ],
    
    UserEmails:[

        {     type:Object,
            required:function validate(){
                if (this.OfferType == 'coupon' && this.couponType=='custom') return true;
            }
        }
       
    ],

    Link:{
        type:String,
    },
    couponUsersLimit: {
        type: Number,
        required: function validate() {
            if (this.OfferType == 'coupon' && this.couponType!='custom') return true;

        },
        min:0
    },

    status:{
        active: {
            type:Boolean,
            default:true,
        },
        deleted:{
            type:Boolean,
            default:false
        }

    },




},
    {
        timestamps: true,
        autoindex: true
    }

)

module.exports = mongoose.model('Offers', offerSchema);