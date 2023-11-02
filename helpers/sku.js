const productModel = require('../models/products');

async function generateSKU(model, category, ){

    const data = await productModel.find({
        'info.category': product.info.category,
        'createdAt': { $lte: Date.now() }
    }).sort({'createdAt': -1});

    const sku = data[0].sku.split(product.info.category);
    const count = Number(sku[sku.length - 1]);

    let code = `SKU-${product.info.category}-${count}`;

    return code;
}


async function generateOrderId(model,category){
    
}
module.exports = {
    generateSKU
}