const products = require("./products");

let schema = {
    couponcode: {
        type: string,
        required: true,
        unique:true
    },
    couponTitle:{
        type:String,
        required:true
    },
    // couponImage:{

    // },
    couponDescription: {
        type: String
    },


    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },
    //  25% =?> 1000 5% , 1000-2000 => 7% ,
    //  max 10% => 
    discountAmount: {
        type: number,
        required: function validate() {
            if (this.discountType == 'flat') return true;

        }
    },
    startDate: {
        type: Date,
        required:true
    },
    endDate: {
        type: Date,
        required:true
    },
    minimumPurchaseAmount: {
        type: number,
        required: function validate() {
            if (this.couponType == 'global') return true;

        }
    },

   
    couponType: {
        type: String,
        enum: ['global', 'Product','other'],
        required: true
    },
    Extrainfo: {
        category: [], // OR OPERATOR
        brand: [], // AND OPERATOR
        required: function validate() {
            if (this.couponType == 'other') return true;
        }
    },
    products:[

        {
            productId:{type:String},
            required:function validate(){
                if(this.couponType=='Product') return true;
                
            }
        },
        
    ],
    usersUsed:[],  // 
    couponUsersLimit:{
        type:number,
        // 122
    },
}