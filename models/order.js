const orderSchema = mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        product: [{

            productInfo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },

            orderInfo: {
                qty: {
                    type: Number,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
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
                    payment: {
                        type: String,
                        enum: ['confirmed', 'pending', 'cancelled', 'refund'],
                        default: 'pending'
                    }
                },
            }
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('orders', orderSchema);
