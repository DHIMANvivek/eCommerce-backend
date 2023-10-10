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
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true,
                },

                //  one order has limitedprodcut or split the products in one order like 15 products split in 3 product
                qty: {
                    type: Number,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
                productSku: {
                    type: String,
                    required: true,
                },
                //  name , photo, category, color , sku, shipment  status,qty,price
                amount: {
                    type: Number,
                    required: true,
                },
                status: {
                    shipment: {
                        type: String,
                        enum: ['pending', 'shipped', 'delivered', 'cancelled', 'declined'],
                        default: 'pending',
                    },
                },
                productName: {
                    type: String,
                    required: true
                }
            }
        ],
        orderAmount: {
            type: Number,
            required: true
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
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.pre('save', function (next) {
    this.orderAmount = this.product.reduce((totalAmount, product) => {
        return totalAmount + product.productInfo.amount;
    }, 0);
    next();
});

module.exports = mongoose.model('orders', orderSchema);