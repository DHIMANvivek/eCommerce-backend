const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const address = require('./address');
const wishlist = require('./wishlist')

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
        minlength: 8,
        // match: ^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$,
        required: function validate() {
            if (this.provider == 'direct') return true;

        }
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
            // validate: {
            //     validator: function (address) {
            //         return address.length <= 3;
            //     },
            //     message: 'You can only add a maximum of 3 addresses.'
            // }
        }
    },
    photo: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    provider: {
        type: String,
        enum: ['GOOGLE', 'direct'],
        required: true,
        default: 'direct',
    },

    Lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'leads',

    }
},
    {
        timestamps: true,
        autoIndex: true,
    });

userSchema.pre("save", async function (next) {
    if (this.password) {
        this.password = bcrypt.hashSync(this.password);
    }    
    next();
});

userSchema.post('save', async function (){
    console.log('id is ',this._id);
    const defaultWishlist = {
        wishlistName : 'My Wishlist',
        products : []
    }
    console.log(this._id, "id assigned");
    await wishlist.create({
        userId : this._id,
        wishlists : [defaultWishlist]
    });
})

module.exports = mongoose.model('users', userSchema);