const wishlist = require('../models/wishlist')
const mongoose = require('mongoose')
const logger = require('./../logger');
const UserModel = require('../models/users')

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
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

async function addToWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id,
            // $exp: {
            //     $eq: [
            //         '$wishlists.wishlistName'.toLowerCase(),
            //         input.wishlistName.toLowerCase()
            //     ]
            // }
            'wishlists.wishlistName': input.wishlistName.trim().toLowerCase()
        });
        if (wishlister && input.type) {
            throw ({ message: 'Wishlist of same name already exists!' })
        }

        if (!wishlister) {
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

        return res.status(200).json({
            message: "Added to " + input.wishlistName + '!'
        })
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

async function deleteWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        if (wishlister) {
            await wishlister.wishlists.splice(input.index, 1);
        }
        wishlister.save()
        return res.status(200).json({
            message: "Wishlist deleted!"
        })
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

async function showWishlistCount(req, res) {
    try {
        const user = req.tokenData;
        const result = await wishlist.findOne({ userId: new mongoose.Types.ObjectId('6541ea9c937b999d318165d7') })
            .populate('wishlists.products', { 'sku': 1, _id: 0 });
        let ans = result.wishlists.some((el) => {
            return el.products.some(e => { e.sku == 'sku-kurti003' })
        })

        res.status(200).json(result);

        // const input = req.body;

        // // const wishlister = await wishlist.findOne({
        // //     userId : user.id
        // // })
        // // const wishlistsArray = wishlister.wishlists
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

        // return res.status(200).json(
        //     count
        // )
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }

}

async function showWishlistedData(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

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
                    'productDetails.info': 1,
                    'productDetails._id': 1,
                    'productDetails.active': 1,
                }
            }
        ])

        return res.status(200).json(products)
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;
        if (!input.wishlistName) {
            const find = await wishlist.findOne({
                userId: user.id,
                'wishlists':
                {
                    $elemMatch:
                        { 'products': { $in: [input.productId] } }
                }
            }, { 'wishlists.$': 1 }
            );
            input.wishlistName = find.wishlists[0].wishlistName;
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
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}


// used in case of emergency 

// async function createDefault(req, res) {
//     try {
//         const getAllusers = await UserModel.find({}, { _id: 1 });
//         console.log('get all user si ', getAllusers);
//         getAllusers.forEach(async (el) => {
//             const defaultWishlist = {
//                 wishlistName: 'my wishlist',
//                 products: []
//             }
//             await wishlist.create({
//                 userId: el._id,
//                 wishlists: [defaultWishlist]
//             });
//         })
//     } catch (error) {
//         console.log('error is ', error);
//     }
// }

module.exports = {
    showWishlists,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    showWishlistCount,
    showWishlistedData,
    // createDefault
}