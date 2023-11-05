const productModel = require('../models/products');

async function generateSKU(product){

    const data = await productModel.find({
        'info.category': { $regex: product.info.category, $options: 'i' },
        'createdAt': { $lte: Date.now() }
    }).sort({'createdAt': -1});

    let code;

    if(!data[0]){
        code = `SKU-${product.info.category}-0`; 
    }else{
        const sku = (data[0].sku).split('-');
        const count = Number(sku[sku.length - 1]);
        code = `sku-${(product.info.category).toLowerCase()}-${count+1}`;
    }
    
    return code;
}


async function generateOrderId(model,category){
    
}
module.exports = {
    generateSKU
}