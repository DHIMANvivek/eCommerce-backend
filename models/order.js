const mongoose = require('mongoose')
const address = require('./address');
const Products = require('../models/products');
const orderSchema = mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        products: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true,
                },

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
                size: {
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
                shipmentStatus: {
                        type: String,
                        enum: ['pending', 'shipped', 'delivered', 'cancelled', 'declined'],
                        default: 'pending',

                },
                name: {
                    type: String,
                    required: true
                },
                //  NEW FIELDS
                SellerId:{
                    type: mongoose.Schema.Types.ObjectId,
                        ref: 'sellerdetails',
                },
                image:{
                    type:String,
                    required:true
                },
 

            }
        ],
        invoice_status: {
            type: Boolean,
            default: false 
        },
        orderID:{
            type:String,
        },

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
            enum: ['success', 'pending', 'cancelled', 'failed', 'refund'],
            default: 'failed'
        },
        active:{
            type:Boolean,
            default:true,
        },
        transactionId:{
            type:String,
            
        },

        // METHOD OF PAYMENT
        MOP:{
            type:String
        },


        coupon:{
        //   type:String
        type: mongoose.Schema.Types.ObjectId,
            ref: 'Offers',
        },
        discount:{
            type:Number,
            default:0,
            required:function (){
                return this.coupon;
            }
        },
        
        orderValueAfterDiscount: {
            type: Number,
            default:this.orderAmount
          },

        active: {
            type: Boolean,
            default: true
        }
       
    },
    {
        timestamps: true,
    }
);



orderSchema.pre('save', function (next) {

    this.orderAmount = this.products.reduce((totalAmount, product) => {
        return totalAmount + product.amount;
    },0);

    if (!this.coupon) {
        this.orderValueAfterDiscount = this.orderAmount;
    }

    if(this.coupon){
        this.orderValueAfterDiscount =this.orderAmount-this.discount;
      }

    next();
});




module.exports = mongoose.model('orders', orderSchema);