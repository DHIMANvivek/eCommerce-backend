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

    // couponcode: {
    //     type: String,
    //     unique:true,
    //     required:   function validate() {
    //             if (this.OfferType == 'coupon') return true;
    //         },
        
    //     unique:function validate() {
    //         if (this.OfferType == 'coupon') return true;
    //     },
    // },
    couponCode: {
        type: String,
        // unique:true,
        required: function () {
          return this.OfferType === 'coupon';
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
        min:0
    },
    // minimumPurchaseAmount: {
    //     type: Number,
    //     required: function validate() {
    //         if (this.OfferType == 'coupon') return true;

    //     },
    //     min:0
    // },

    minimumPurchaseAmount: {
        type: Number,
        min: 0,
        required: function () {
          return this.OfferType === 'coupon';
        },
      },

    ExtraInfo:{
    categories:[{type:String,lowercase:true}],
    brands:[{type:String}]    
    },


    couponType: {
        type: String,
        enum: ['global', 'custom','new'],
        required:function(){
            return (this.OfferType == 'coupon');
        },
        
    },
    // userUsed:[
    //     {
    //     // ref:'users',
    //     // type: mongoose.Schema.Types.ObjectId,
        
    // }
    // ],
    
    userUsed: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Assuming your user model is named 'User'
        },
        
      ],
    // UserEmails:[

    //     {     type:Object,
    //         required:function validate(){
    //             if (this.OfferType == 'coupon' && this.couponType=='custom') return true;
    //         }
    //     }
       
    // ],
    UserEmails: [
        {
           email: {
              type: String,
              lowercase: true,
              required: function () {
                 return this.OfferType === 'coupon' && this.couponType === 'custom';
              },
           },
        },
     ],
     
  

    // Link:{
    //     type:String,
    // },
    couponUsersLimit: {
        type: Number,
        required: function () {
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

offerSchema.pre('save', function (next) {
        if (this.OfferType === 'discount') {
          this.userUsed = null;
          this.UserEmails = null;
          req.body.couponType=null;
          req.body.couponCode=null;
          req.body.minimumPurchaseAmount=null;
          req.body.couponUsersLimit=null;
        } 

        if(this.OfferType=='coupon'){
            this.ExtraInfo=null;
            if(this.couponType!='custom'){
                this.UserEmails=null;
                this.userUsed=[];
            }
            else{
                this.userUsed=null;
                this.couponUsersLimit=null;
            }
        }
        next();
})


  
module.exports = mongoose.model('Offers', offerSchema);