const productModel = require('../models/products');

async function generateSKU(product){

    const data = await productModel.findOne({
        'info.category': product.info.category.toLowerCase(),
    }).sort({'createdAt': -1});
    
    console.log(data.sku);

    let code;

    if(!data){
        code = `sku-${product.info.category}-0`; 
    }else{
        // console.log(data[0].sku);
        const sku = (data.sku).split('-');
        const count = Number(sku[sku.length - 1]);
        console.log(count);
        code = `sku-${(product.info.category).toLowerCase()}-${count+1}`;
    }
    return code;
}

module.exports = {
    generateSKU
}


// async function generateSKU(products){

//     if(Array.isArray(products)){
//         products.forEach((product)=>{
//             product['sku'] = SKU(product.info.category);
//         })
//     }



//     return products;
// }

// async function SKU(category){

//     const data = await productModel.find({
//         'info.category': { $regex: category, $options: 'i' },
//         'createdAt': { $lte: Date.now() }
//     }).sort({'createdAt': -1});

//     let code;
    
//     if(!data[0] && !Object.keys(category).includes(product.info.category.toLowerCase())){
//         category[product.info.category.toLowerCase()] = 0;
//         code = `sku-${product.info.category}-0`;
//     }
//     else if(!data[0] && Object.keys(category).includes(product.info.category.toLowerCase())){
//         let count = category[product.info.category.toLowerCase()];
//         code = `sku-${product.info.category}-${count+1}`;
//     }
//     else{
//         const sku = (data[0].sku).split('-');
//         const count = Number(sku[sku.length - 1]);
//         code = `sku-${product.info.category}-${count+1}`;
//     }

//     return code;
// }