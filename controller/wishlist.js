const wishlist = require('../models/wishlist')

async function showWishlists(req, res){
    const user = req.tokenData;
    console.log(user, "showWishlists");

    const wishlister = await wishlist.findOne({
        userId : user.id
    })
    console.log(wishlister, "lol");
    if (wishlister) {
        const wishlists = wishlister.wishlists
        console.log(wishlists, "wishlistssss");
        return res.status(200).json(
            wishlists
        )
    }
    else {
        console.log("nhi mila")
    }
}
module.exports = {
    showWishlists
}