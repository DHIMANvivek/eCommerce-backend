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
                //  NEW FIELDS
                sellerID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'sellerdetails',
                },

                sku: {
                    type: String,
                    required: true,
                },

                // productInfo

                productInfo: {
                    name: {
                        type: String,
                        required: true
                    },
    
                    image: {
                        type: String,
                        required: true
                    },
                    category: {
                        type: String,
                        required: true
                    },
                    brand: {
                        type: String,
                        required: true
                    },
                },

                // orderInfo

                quantity: {
                    type: Number,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
                size: {
                    type: String,
                    required: true,
                },
                amount: {
                    type: Number,
                    default: function () { return this.quantity * this.price }
                    // set:function(){return this.quantity*this.price}
                },
                price: {
                    type: Number,
                    required: true
                },

                shipmentStatus: {
                    type: String,
                    enum: ['pending', 'shipped', 'delivered', 'cancelled', 'declined'],
                    default: 'pending',

                },
                payment_status: {
                    type: String,
                    enum: ['success', 'pending', 'cancelled', 'failed', 'refund'],
                    default: 'pending'
                },
            }
        ],
        invoice_status: {
            type: Boolean,
            default: false
        },
        orderID: {
            type: String,
        },

        orderDate: {
            type: Date,
            required: true,
            default: new Date()
        },
        address: address,

        // payment_status: {
        //     type: String,
        //     enum: ['success', 'pending', 'cancelled', 'failed', 'refund'],
        //     default: 'pending'
        // },
        active: {
            type: Boolean,
            default: true,
        },
        transactionId: {
            type: String,

        },

        // METHOD OF PAYMENT
        MOP: {
            type: String
        },

        OrderSummary: {
            subTotal: { type: Number },
            shipping: { type: Number, default: 0 },
            Total: { type: Number },
            couponDiscount: { type: Number, default: 0 }
        },

        coupon: {
            //   type:String
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Offers',
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.pre('save', function (next) {
    this.OrderSummary.subTotal = this.products.reduce((totalAmount, product) => {
        return totalAmount + product.amount;
    }, 0);

    if (this.OrderSummary.couponDiscount) {
        this.OrderSummary.Total = this.OrderSummary.subTotal - this.OrderSummary.couponDiscount + this.OrderSummary.shipping;
    }
    else {
        this.OrderSummary.Total = this.OrderSummary.subTotal + this.OrderSummary.shipping;
    }
    next();
});




module.exports = mongoose.model('orders', orderSchema);