const { db } = require('../models/users');
const wishlist = require('../models/wishlist')
const mongoose = require('mongoose')
const users = require('../models/users')

async function showWishlists(req, res) {
    try {
        const user = req.tokenData;
        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        if (wishlister) {
            const wishlists = wishlister.wishlists
            const count = (await wishlist.aggregate([
                {
                    $match: { 'userId': new mongoose.Types.ObjectId(user.id) }
                },
                {
                    $unwind: '$wishlists'
                },
                {
                    $unwind: '$wishlists.products'
                }
            ])).length;
            return res.status(200).json(
                {
                    wishlists, count
                }
            )
        }
        else {
            console.log("Wishlister not found. Please signup.")
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Error in showing wishlists!"
        })
    }
}

// async function addWishlist(req, res) {
//     try {
//         const input = req.body;
//         const user = req.tokenData;

//         const wishlister = await wishlist.findOne({
//             userId: user.id
//         })
//         console.log(wishlister, "wishlister");

//         const newWishlist = {
//             wishlistName: input.wishlistName,
//             products: []
//         }
//         console.log(wishlister.wishlists, "before adding new wishlist");
//         const add = await wishlister.wishlists.push(newWishlist)
//         wishlister.save()
//         console.log(wishlister.wishlists, "after adding new wishlist");
//         return res.status(200).json({
//             message: "New Wishlist created successfully!"
//         })
//     }
//     catch (error) {
//         console.log(error, "addWishlist")
//         return res.status(500).json({
//             message: "Error in creating new wishlist!"
//         })
//     }
// }

async function addToWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id,
            'wishlists.wishlistName': input.wishlistName
        })
        // console.log(wishlister, "wishlisterrr");

        if (!wishlister) {
            console.log("here inside");
            const newWishlist = {
                wishlistName: input.wishlistName,
                products: []
            }
            const response = await wishlist.updateOne({ userId: user.id }, { $push: { 'wishlists': newWishlist } });
        }

        const add = await wishlist.updateOne({
            userId: user.id,
            'wishlists.wishlistName': input.wishlistName
        }, {
            $push: {
                'wishlists.$.products': new mongoose.Types.ObjectId(input.productId)
            }
        });

        // console.log("hogya product addd");
        return res.status(200).json({
            message: "Product successfully added to wishlist!"
        })
    }
    catch (error) {
        console.log(error, "couldnt add product to wishlist!");
        return res.status(500).json({
            message: "Error while adding product to wishlist!"
        })
    }
}

// async function removeFromWishlist(req, res) {
//     try {
//         const input = req.body;
//         const user = req.tokenData;

//         const wishlister = await wishlist.findOne({
//             userId: user.id
//         })

//         if (wishlister) {
//             const remove = await wishlist.updateOne({
//                 userId: user.id,
//                 'wishlists.wishlistsName': input.WishlistName
//             }, {
//                 $pull: {
//                     'wishlists.products': {

//                     }
//                 }
//             })
//         }
//     }
//     catch {

//     }
// }

async function deleteWishlist(req, res) {
    try {
        const input = req.body;
        // console.log(input, "input/?/");
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        if (wishlister) {
            const del = await wishlister.wishlists.splice(input.index, 1);
        }
        wishlister.save()
        // console.log(wishlister.wishlists, "after deletion");
        return res.status(200).json({
            message: "Wishlist deleted!"
        })
    }
    catch (error) {
        console.log(error, "error while deleting wishlist!")
        return res.status(500).json({
            message: "Couldn't delete wishlist"
        })
    }
}

async function showWishlistCount(req, res) {
    try {
        const user = req.tokenData;
        // console.log("hello", user.id);
        const result = await wishlist.findOne({ userId: new mongoose.Types.ObjectId('6541ea9c937b999d318165d7') })
            .populate('wishlists.products', { 'sku': 1, _id: 0 });
        // console.log(result, 'dddd');
        let ans = result.wishlists.some((el) => {
            return el.products.some(e => { e.sku == 'sku-kurti003' })
        })

        res.status(200).json(result);

        // const input = req.body;

        // // const wishlister = await wishlist.findOne({
        // //     userId : user.id
        // // })
        // // const wishlistsArray = wishlister.wishlists
        // // // console.log(wishlister.wishlists, "wishlistsss");
        // // let count = 0;

        // // wishlistsArray.forEach(wishlist => {
        // //     let length = wishlist.products.length
        // //     count += length;
        // // });

        // const count = (await wishlist.aggregate([
        //     {
        //         $match: { 'userId': new mongoose.Types.ObjectId(user.id) }
        //     },
        //     {
        //         $unwind: '$wishlists'
        //     },
        //     {
        //         $unwind: '$wishlists.products'
        //     }
        // ])).length;

        // // console.log(count, "my count")
        // return res.status(200).json(
        //     count
        // )
    }
    catch (error) {
        console.log('error is ', error);
    }
}

async function showWishlistedData(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;
        // console.log(input.wishlistName, "kosni wishlist");

        let products = await wishlist.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
            { $unwind: '$wishlists' },
            { $match: { 'wishlists.wishlistName': input.wishlistName } },
            { $unwind: '$wishlists.products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'wishlists.products',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $project: {
                    'productDetails.sku': 1,
                    'productDetails.name': 1,
                    'productDetails.assets': 1,
                    'productDetails.price': 1,
                    'productDetails.info.brand': 1,
                    'productDetails._id': 1
                }
            }

        ])

        return res.status(200).json(products)
    }
    catch (error) {
        return res.status(500).json(products)
    }
}

async function removeFromWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;
        if(!input.wishlistName){
            const find=await wishlist.findOne({userId:user.id,
                'wishlists':
                {$elemMatch:
                    {'products':{$in:[input.productId]}}
                }
            },{'wishlists.$':1}   
            );
            console.log('find come uo is ',find);
                input.wishlistName=find.wishlists[0].wishlistName;
        }
      
        const response = await wishlist.updateOne(
            {
                userId: user.id,
                'wishlists.wishlistName': input.wishlistName
            },
            {
                $pull: {
                    "wishlists.$.products": input.productId
                }
            }
        )
        return res.status(200).json({
            message: "Product removed from wishlist!",
            response
        })
    }


    catch (error) {
        console.log('erroris ', error);
    }
}




// async function insertWishlists(req, res) {
//     try {

//         let findAllusersId = await users.find({}, { _id: 1 });
//         findAllusersId = JSON.parse(JSON.stringify(findAllusersId));
//         findAllusersId = Promise.all(findAllusersId.map(async (el) => {
//             // return { userId: el._id };

//             const ab = await wishlist.updateMany({userId:el._id},
//                 {
    
//                     $set: {
//                         'wishlists': [{
//                             'wishlistName': 'My Wishlist',
//                             'products': []
//                         }]
//                     }
//                 },
//                 {
//                     "upsert": true
//                 }
//             )
//         }))
//         console.log(findAllusersId, "-----");

//         // return;

      

//         console.log('inserWishlist is ', insertWishlists);
//     }


//     catch (error) {
//         console.log(error, "error in inserting wihlists");
//     }
// }

module.exports = {
    showWishlists,
    // addWishlist,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    showWishlistCount,
    showWishlistedData,
    // insertWishlists,
}