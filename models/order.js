const mongoose = require('mongoose')
const address = require('./address');

const orderSchema = mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        product: [
            {
                // productId: {
                //     type: mongoose.Schema.Types.ObjectId,
                //     ref: 'products',
                //     required: true,
                // },

                //  one order has limitedprodcut or split the products in one order like 15 products split in 3 product
                quantity: {
                    type: Number,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
                sku: {
                    type: String,
                    required: true,
                },
                //  name , photo, category, color , sku, shipment  status,qty,price
                amount: {
                    type: Number,
                    default:function(){ return this.quantity*this.price}
                    // set:function(){return this.quantity*this.price}
                },
                price:{
                    type:Number,
                    required:true
                },
                status: {
                    shipment: {
                        type: String,
                        enum: ['pending', 'shipped', 'delivered', 'cancelled', 'declined'],
                        default: 'pending',
                    },
                },
                name: {
                    type: String,
                    required: true
                }
            }
        ],
        orderAmount: {
            type: Number,
        },
        orderDate: {
            type: Date,
            required: true,
            default: new Date()
        },
        address: address,
        payment_status: {
            type: String,
            enum: ['confirmed', 'pending', 'cancelled', 'refund'],
            default: 'pending'
        },
        OTP:{
            type:Number,
            default:function OtpCreater(){
                return Math.floor((Math.random() * 999999));
            },
            // default:100000,
            validate: {
                validator: function (value) {
                  // Check if the value is a number and has at least 6 digits.
                  let result= value >= 100000 && value<=999999;
                  console.log('value coming is ',value," result is ",result, " ",value >= 100000," "," ",value<=999999);
                  return result;
                },
                message: 'Your field must be a number with a minimum of 6 digits.',
              },
        },
        couponCode:{
          type:String
        },
        discount:{
            type:Number,
            default:0,
            required:function (){
                return this.couponApplied;
            }
        },
        
        orderValueAfterDiscount: {
            type: Number,
          },
       
    },
    {
        timestamps: true,
    }
);



orderSchema.pre('save', function (next) {


    this.orderAmount = this.product.reduce((totalAmount, product) => {
        return totalAmount + product.amount;
    },0);

    if (!this.couponCode) {
        this.orderValueAfterDiscount = this.orderAmount;
      }
    
      if(this.couponCode){
        console.log('coupon applied is ',this.couponApplied);
        this.orderValueAfterDiscount =this.orderAmount-this.discount;
      }
    
    next();
});

module.exports = mongoose.model('orders', orderSchema);