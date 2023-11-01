const productModel = require('../models/products');

async function generateSKU(product){

    const data = await productModel.find({
        'info.category': product.info.category,
        'createdAt': { $lte: Date.now() }
    }).sort({'createdAt': -1});

    const sku = data[0].sku.split(product.info.category);
    const count = sku[sku.length - 1];
    
    const length = count.length() - Number(count).length;

    let code = `SKU-${product.info.category}+-+count`;
}

module.exports = {
    generateSKU
}