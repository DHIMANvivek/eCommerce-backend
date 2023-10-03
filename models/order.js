const mongoose=require('mongoose')
const orderSchema = mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        product: [{

            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },   

            productInfo: {
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
                    payment_status: {
                        type: String,
                        enum: ['confirmed', 'pending', 'cancelled', 'refund'],
                        default: 'pending'
                    }
                },
            }
        }],

        // NEW FIELDS
        orderAmount: {
            type: Number,
           required:true
          },

          orderDate:{
            type:Date,
            required:true,
            default:new Date()
          },
          address: {
           
                firstname:{
                    type: String,
                    trim: true,
                    required:true,
                    lowercase: true
                },
                lastname:{
                    type: String,
                    trim: true,
                    lowercase: true
                },

                apartment:{
                    type: String,
                    trim: true,
                    required:true,
                    lowercase: true
                },

                area:{
                    type: String,
                    trim: true,
                    required:true,
                    lowercase: true
                },

                landmark:{
                    type: String,
                    trim: true,
                     required:true,
                    lowercase: true
                },

               
                pincode: {
                    type: Number,
                    trim: true,
                    required: ['true', "Please enter a valid pincode"]
                },

                town_city:{
                    type: String,
                    trim: true,
                    required:true,
                    lowercase: true
                },
                state: {
                    type: String,
                    trim: true,
                    required:true,
                    lowercase: true
                },

                country: {
                    type: String,
                    trim: true,
                    lowercase: true,
                    default: "India"
                },
                defaultAddress:{
                    type:Boolean,
                    default:false
                },

               
        
            
        }


            /* order 
            
                paymentstatus:[pending,sucess]
                paymentmethod:[enum:[gpay,card,upi,cod]]
                orderstatus:[]

            */ 
        
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
