const Cart = require('../models/cart');
const productsController = require('../controller/products');

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
        cart.details = req.body;
        // console.log(cart);
        cart.details = await Promise.all(cart.details.map(async (item) => {
            let product = await productsController.fetchProductDetails(req, res, item.sku);
            const fields = ['name', 'assets', 'info', 'price'];

            for (let field of fields) {
                if (field === 'info') {
                    if (!item.info) {
                        item.info = {};
                    }
                    // item.info['size'] = product.info.size;
                    item.info['category'] = product.info.category;
                    item.info['orderQuantity'] = product.info.orderQuantity;
                } else {
                    item[field] = product[field];
                }
            }

            // setting defaults if not choosen
        
            item.quantity = item.quantity ? item.quantity : product.info.orderQuantity[0];
            item.color = item.color ? item.color : product.assets[0].color;

            item.size = item.size ? item.size : product.assets.find((asset)=>{
                return asset.color === item.color;
            }).stockQuantity[0].size;
            
            // amounting
            // shipping will be calculated after getting it from tracking page dynamically later
            cart.amounts.subTotal += item.price * item.quantity;
            //will be calculated after discount/coupan page is complete
            cart.amounts.savings += 0;
            
            return item;
        }));

        // console.log(cart);
        // cart.amounts.savings -= cart.amounts.subTotal;
        // cart.amounts.savings = (Math.round((cart.amounts.savings) * 100)) / 100;
        cart.amounts.subTotal = (Math.round((cart.amounts.subTotal) * 100) / 100);
        cart.amounts.total = cart.amounts.subTotal + cart.amounts.shipping;

        res.status(200).json(cart);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Problem while fetching Cart'
        });
    }
}

module.exports = {
    fetchCart,
}