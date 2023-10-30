const Cart = require('../models/cart');
const productsController = require('../controller/products');
const { verifyToken } = require('./../helpers/jwt');

async function fetchCart(req, res) {
    try {
        let cart = {
            amounts: {
                subTotal: 0,
                shipping: 0,
                savings: 0,
                total: 0
            }
        };

        if (req.headers.authorization) {
            req.tokenData = verifyToken(req.headers.authorization.split(' ')[1])
            delete req.headers;
        }

        if (req.tokenData) {
            let userId = req.tokenData.id;
            let cartExists = await Cart.findOne({ userId: userId });
            cart.details = (cartExists ? cartExists : {items: []}).items;
        }
        else {
            cart.details = req.body;
        }
        
        cart.details = await Promise.all(cart.details.map(async (copy) => {
            let item = JSON.parse(JSON.stringify(copy));
            console.log(item);
            let product = await productsController.fetchProductDetails(req, res, item.sku);
            const fields = ['name', 'assets', 'info', 'price'];

            for (let field of fields) {
                if (field === 'info') {
                    if (!item.info) {
                        item.info = {};
                    }

                    item.info['category'] = product.info.category;
                    item.info['orderQuantity'] = product.info.orderQuantity;
                } else {
                    item[field] = product[field];
                }
            }

            // setting defaults if not choosen
            item.quantity = item.quantity ? item.quantity : product.info.orderQuantity[0];
            item.color = item.color ? item.color : product.assets[0].color;

            item.size = item.size ? item.size : product.assets.find((asset) => {
                return asset.color === item.color;
            }).stockQuantity[0].size;

            // amounting
            // shipping will be calculated after getting it from tracking page dynamically later
            cart.amounts.subTotal += item.price * item.quantity;
            //will be calculated after discount/coupan page is complete
            cart.amounts.savings += 0;

            return item;
        }));

        // cart.amounts.savings -= cart.amounts.subTotal;
        // cart.amounts.savings = (Math.round((cart.amounts.savings) * 100)) / 100;
        cart.amounts.subTotal = (Math.round((cart.amounts.subTotal) * 100) / 100);
        cart.amounts.total = cart.amounts.subTotal + cart.amounts.shipping;

        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({
            message: 'Problem while fetching Cart'
        });
    }
}

async function addItems(req, res) {
    try {
        let userId = req.tokenData.id;
        let items = req.body;

        let existingCart = await Cart.findOne({ userId: userId });

        items = await Promise.all(items.map(async (item) => {
            let product = await productsController.fetchProductDetails(req, res, item.sku);

            item.quantity = item.quantity ? item.quantity : product.info.orderQuantity[0];
            item.color = item.color ? item.color : product.assets[0].color;

            item.size = item.size ? item.size : product.assets.find((asset) => {
                return asset.color === item.color;
            }).stockQuantity[0].size;

            return item;
        }))

        if (existingCart) {
            await Cart.updateOne({ userId: userId }, { $push: { items: items } });
        } else {
            await Cart.create({ userId: userId, items: items });
        }

        return res.status(200).json({
            message: "Item/s successfully added to cart"
        })

    } catch (error) {
        res.status(500).json({
            message: 'Problem while adding item/s to Cart'
        });
    }
}

async function removeItem(req, res) {
    try {
        const userId = req.tokenData.id;
        const itemId = req.body.itemId;

        await Cart.updateOne({ userId: userId },
            {
                $pull: {
                    items: { _id: itemId }
                }
            });

        res.status(200).json({
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Problem while removing Item from Cart'
        });
    }
}

async function updateItem(req, res) {
    try {
        const userId = req.tokenData.id;
        const itemId = req.body.index;
        const newQuantity = req.body.quantity;

        console.log(itemId);
        await Cart.updateOne(
            { userId: userId, 'items._id': itemId },
            { $set: { 'items.$.quantity': newQuantity } }
        );

        let cart = (await Cart.findOne({ userId: userId })).items;
        console.log(newQuantity, cart);

        res.status(200).json({
            message: 'Cart item updated successfully',
            updated: true
        });

    } catch (error) {
        res.status(500).json({
            message: 'Problem while updating Item from Cart',
            updated: false
        });
    }
}

async function clearCart(req, res) {
    try {
        const userId = req.tokenData.id;
        await Cart.deleteOne({ userId: userId });

        res.status(200).json({
            message: 'Cart Cleared'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Problem while clearing Cart',
            updated: false
        });
    }
}

module.exports = {
    fetchCart,
    addItems,
    updateItem,
    removeItem,
    clearCart,
    removeItem
   
}