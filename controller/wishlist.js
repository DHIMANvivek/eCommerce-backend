const wishlist = require('../models/wishlist')
const mongoose = require('mongoose')

async function showWishlists(req, res) {
    try {
        const user = req.tokenData;
        console.log(user, "showWishlists");

        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        console.log(wishlister, "lol");
        if (wishlister) {
            const wishlists = wishlister.wishlists
            console.log(wishlists, "wishlistssss");
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
            console.log("User not found.")
        }
    }
    catch (error) {
        console.log(error, "showWishlist");
        return res.status(500).json({
            message: "Error in showing wishlists!"
        })
    }
}

async function addWishlist(req, res) {
    try {
        console.log(req.body, "addWishlist func");
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        console.log(wishlister, "wishlister");

        const newWishlist = {
            wishlistName: input.wishlistName,
            products: []
        }
        console.log(wishlister.wishlists, "before adding new wishlist");
        const add = await wishlister.wishlists.push(newWishlist)
        wishlister.save()
        console.log(wishlister.wishlists, "after adding new wishlist");
        return res.status(200).json({
            message: "New Wishlist created successfully!"
        })
    }
    catch (error) {
        console.log(error, "addWishlist")
        return res.status(500).json({
            message: "Error in creating new wishlist!"
        })
    }
}

async function addToWishlist(req, res) {
    try {
        console.log(req.body, "input");
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id
        })
        console.log(wishlister, "wishlister");

        const add = await wishlist.updateOne({
            userId: user.id,
            'wishlists.wishlistName': input.wishlistName
        }, {
            $push: {
                'wishlists.$.products': new mongoose.Types.ObjectId(input.productId)
            }
        });

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

async function removeFromWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

        const wishlister = await wishlist.findOne({
            userId: user.id
        })

        if (wishlister) {
            const remove = await wishlist.updateOne({
                userId: user.id,
                'wishlists.wishlistsName': input.WishlistName
            }, {
                $pull: {
                    'wishlists.products': {

                    }
                }
            })
        }
    }
    catch {

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
            const del = await wishlister.wishlists.splice(input.index, 1);
        }
        wishlister.save()
        return res.status(200).json({
            message: "Wishlist deleted successfully!"
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
        const input = req.body;
        const user = req.tokenData;

        // const wishlister = await wishlist.findOne({
        //     userId : user.id
        // })
        // const wishlistsArray = wishlister.wishlists
        // // console.log(wishlister.wishlists, "wishlistsss");
        // let count = 0;

        // wishlistsArray.forEach(wishlist => {
        //     let length = wishlist.products.length
        //     count += length;
        // });

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

        // console.log(count, "my count")
        return res.status(200).json(
            count
        )
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

        console.log('products is =====> ', products);

        return res.status(200).json(products)
    }
    catch (error) {
        console.log('error is ', error);
        return res.status(500).json(products)
    }
}

async function removeFromWishlist(req, res) {
    try {
        const input = req.body;
        const user = req.tokenData;

        console.log(input, "del data");
        // const final =await wishlist.findOne(
        //     {
        //         userId : new mongoose.Types.ObjectId(user.id)
        //     }
        // );

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

        return res.status(200).json(response)
    }


    catch (error) {
        console.log('erroris ', error);
    }
}
module.exports = {
    showWishlists,
    addWishlist,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    showWishlistCount,
    showWishlistedData,
    removeFromWishlist
}