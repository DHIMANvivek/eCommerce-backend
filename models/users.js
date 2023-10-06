const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const address = require('./address');

let userSchema = new mongoose.Schema({

    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    },
    name: {
        firstname: {
            type: String,
            trim: true,
            default: '',
        },
        lastname: {
            type: String,
            trim: true,
            default: '',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        // match: ^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$,
        required:function validate(){
            if(this.provider=='direct') return true;
            
        }
    },
    mobile: {
        type: Number,
        trim: true,
        minLength: [10],
        maxLength: [10]
    },
    info: {
        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },
        dob: {
            type: Date,
        },
        address: {
            type: [address],
            validate:  {
                validator: function (address) {
                    return address.length <= 3;
                },
                message: 'You can only add a maximum of 3 addresses.'
            }
        }
    },
    photo: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'seller', 'admin`7ux'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    provider:{
        type: String,
        enum: ['GOOGLE', 'direct'],
        required:true,
        default:'direct',
    },

    Lead:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'leads',
     
    }
},
    {
        timestamps: true,
        autoIndex: true,
    });

    userSchema.pre("save", function (next){
        if(this.password){
            this.password= bcrypt.hashSync(this.password); 
           
        }
        next();
    });
    
module.exports = mongoose.model('users', userSchema);