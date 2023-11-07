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
                // invoice_status:{
                //     type:Boolean,
                //     default:false,
                // },
                // invoiceId:{
                //     type:String,
                // },

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

        // OTP:{
        //     type:Number,
        //     default:function OtpCreater(){
        //         return Math.floor((Math.random() * 999999));
        //     },
        //     // default:100000,
        //     validate: {
        //         validator: function (value) {
        //           // Check if the value is a number and has at least 6 digits.
        //           let result= value >= 100000 && value<=999999;
        //           console.log('value coming is ',value," result is ",result, " ",value >= 100000," "," ",value<=999999);
        //           return result;
        //         },
        //         message: 'Your field must be a number with a minimum of 6 digits.',
        //       },
        // },


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



orderSchema.post('save',async function (){

    this.products.forEach(async (el)=>{
        const findQuantity=await Products.findOne({
                sku: el.sku,
                'assets.color': el.color,
                'assets.stockQuantity.size': el.size
        }, {'assets.stockQuantity.quantity':1,_id:0});
        if(el.quantity>findQuantity) el.quantity=findQuantity;
        else el.quantity=el.quantity;
        const updateProduct = await Products.updateOne(
            {
              sku: el.sku,
              'assets.color': el.color,
              'assets.stockQuantity.size': el.size
            },
            
            {
              $inc: { 'assets.$[outer].stockQuantity.$[inner].quantity': -el.quantity , 'assets.$[outer].stockQuantity.$[inner].unitSold': el.quantity },
            },
            {
              arrayFilters: [
                { "outer.color": el.color }, 
                { "inner.size": el.size } 
              ]
            }
          );
    })
  
})
module.exports = mongoose.model('orders', orderSchema);