const Products = require('../models/products');
const reviewsController = require('../controller/reviews');
const OffersModel = require('../models/offers');
const { verifyToken } = require('../helpers/jwt');

// variably pending 
async function fetchAll(req, res) {
    try {
        let output = await Products.find();
        res.status(200).json(output);
    } catch (error) {
        res.status(500).json({
            message: 'Unable to fetch Products'
        });
    }
}

// ideal for Product page
// async function fetchProductDetails(req, res, sku = null) {
//     try {

//         let query = {};
//         let user;
//         if (req.headers.authorization){
//             user = verifyToken(req.headers.authorization.split(' ')[1])
//             if (user.role == 'admin') query['sellerID'] = user.id;
//         }

//         query['sku'] = req.query.sku ? req.query.sku : sku;

//         let product = JSON.parse(JSON.stringify(await Products.findOne(
//             query,
//             {
//                 active: 0,
//                 updatedAt: 0
//             }     
//             )));

//         // getting all the reviews and average
//         // let reviews_rating = await reviewsController.fetchReviews(product._id, user.id);
//         // product.avgRating = reviews_rating.avgRating;
//         // product.reviews = reviews_rating.reviews;

//         if (req.query.sku) {
//             res.status(200).json(product);
//             return;
//         }
//         return product;

//     } catch (error) {
//         console.log('error coming is ',error);
//         res.status(500).json({
//             message: 'This Product is not available'
//         });
//     }
// }

async function fetchProductDetails(req, res, sku = null) {
    try {

        let query = {};
        let user;
        if (req.headers.authorization){
            user = verifyToken(req.headers.authorization.split(' ')[1])
            if (user.role == 'admin') query['sellerID'] = user.id;
        }

        query['sku'] = req.query.sku ? req.query.sku : sku;
        
        let product = JSON.parse(JSON.stringify(await Products.findOne(
            query,
            {
                active: 0,
                updatedAt: 0
            }     
            )));

        // getting all the reviews and average
        console.log('product is ',product);
        const reviews_rating = await reviewsController.fetchReviews(
            product._id,
            user ? user.id : ''
        );

        product.avgRating = reviews_rating.avgRating;
        product.reviews = reviews_rating.reviews;
        if(reviews_rating.userReview){
            product.userReview = reviews_rating.userReview;
        }

        if(req.query.sku){
            res.status(200).json(product);
            return;
        }
        return product;

    } catch (error) {
        console.log('error is ',error);
        res.status(500).json({
            message: 'This Product is not available'
        });
    }
}

// exploring, searching and filtering
async function fetchProducts(req, res) {
    try {
        req.query = req.query ? req.query : req.body;
        let limit = req.query.limit || 8;
        let page = req.query.page || 1;
        let skip = (page - 1) * limit;
        delete req.query.page;
        delete req.query.limit;

        // Search
        let search = req.query.search || '';
        delete req.query.search;

        // aggregation pipe array
        aggregationPipe = [
            {
                $match: {
                    $or: [
                        { "info.category": { $regex: search, $options: 'i' } },
                        { "info.brand": { $regex: search, $options: 'i' } },
                        { "info.composition": { $regex: search, $options: 'i' } },
                        { "info.tags": { $regex: search, $options: 'i' } },
                        { "name": { $regex: search, $options: 'i' } },
                        { "sku": { $regex: search, $options: 'i' } },
                    ]
                }
            },
            {
                $project: {
                    subTitle: 0,
                    description: 0,
                    sellerID: 0
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ];
        if ((Object.keys(req.query)).length > 0) {
            aggregationPipe.unshift(
                {
                    $match: getFilterQuery(req.query)
                })
        }

        // fetching the data
        let products = await Products.aggregate(aggregationPipe);
    
        let matchedProducts = {
            total: 0
        };
        products  = await getProductPrice((products));
        matchedProducts.items = await Promise.all(products.map(async (product) => {
            // product.avgRating = (await reviewsController.fetchReviews(product._id)).avgRating;
            product.avgRating=0;
            matchedProducts.total++;
            return product;
        }));
        res.status(200).json(matchedProducts);

        // filter aggregation query helper function
        function getFilterQuery(parameters) {
            const keys = Object.keys(parameters);
            const query = [];

            keys.forEach((key) => {
                if (Array.isArray(parameters[key])) {
                    if (key === 'color') {
                        const colorConditions = parameters[key].map(color => ({
                            'assets.color': { $regex: new RegExp(`^${color}$`, 'i') }
                        }));
                        query.push({ $or: colorConditions });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $in: parameters[key].map(value => new RegExp(`^${value}$`, 'i')) } });
                    }
                } else {
                    if (key === 'color') {
                        query.push({ [`assets.color`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                    else if (key === 'minPrice') {
                        query.push({ 'price': { $gte: parseFloat(parameters[key]) } });
                    }
                    else if (key === 'maxPrice') {
                        query.push({ 'price': { $lte: parseFloat(parameters[key]) } });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                }
            });

            return { $and: query };
        }

    } catch (error) {
        console.log('error coming is ',error);
        res.status(500).json({
            message: 'Unable to fetch Products'
        });
    }
}



async function fetchUniqueFields(req, res) {
    const products = await Products.find({});

    function getData(products, parameter = 'all') {

        const uniqueData = {
            size: [],
            category: [],
            price: [],
            brand: [],
            tags: [],
        }

        let filterObject;

        if (parameter != 'all') {
            filterObject2 = { male: uniqueData, female: uniqueData };
        }
        else {
            filterObject = uniqueData;
        }

        products.forEach((data) => {

            if (parameter != 'all') {

                // console.log('filterObject EVERY TIME IS  ',filterObject);
                if (data.info.gender == 'male') {
                    // console.log("male"); 
                    a = aa;
                    filterObject = filterObject2.male; // object  male: uniqueData, female: uniqueData }  
                }
                else {
                    // console.log("female  ",filterObject.female);
                    filterObject = filterObject2.female;
                }
            }
            for (let filter in filterObject) {

                if (filter in data) {
                    target = data;
                }
                else {
                    target = data.info;
                }

                const value = target[filter];

                if (Array.isArray(value)) {
                    for (let v of value) {
                        const arr = filterObject[filter];

                        if (!arr.includes(v)) {
                            arr.push(v);
                        }
                    }
                }
                else {
                    const arr = filterObject[filter];
                    if (!arr.includes(value)) {
                        arr.push(value);
                    }
                }
            }
            // return uniqueData;
        });

        return uniqueData;
    }

    const data = getData(products, 'all');
    // console.log('data is ', data);
    res.status(200).json({ data });

    // console.log(uniqueData);

    // res.status(200).json(uniqueData);
}

async function getProductPrice(products) {
    try {
        let discount;
        if (!Array.isArray(products)) {
            discount = await discountQuery(products);
        products=await discountQuery(products); 
        }
        else {
            products = await Promise.all(products.map(async (product) => {
                if(!(product.info)){
                    product = await Products.findOne({ sku: product.sku });
                }   
                product = await discountQuery(product); 
                return product;
            }))
        }
        return new Promise((res,rej)=>{
            res(products);
        })

    } catch (error) {
        res.status(500).json(error);
    }

    async function discountQuery(parameter) {
        
        let product = JSON.parse(JSON.stringify(parameter));

        return new Promise(async (res,rej)=>{

            let discount = await OffersModel.findOne({
                $or: [{ 'ExtraInfo': { $exists: false } }, { "ExtraInfo.categories": { $in: [product.info.category] } },
                { "ExtraInfo.brands": { $in: [product.info.brand] } },
                ], OfferType: 'discount'
            }, { 'discountType': 1, 'discountAmount': 1, 'DiscountPercentageType': 1, 'maximumDiscount': 1, 'OfferType': 1 })

        if (discount == null) {
            res(product);
            return;
         }
        product.discountType = discount.discountType;
        product.discount = Math.floor(discount.discountAmount); 
        if (discount.discountType == 'percentage' && discount.DiscountPercentageType == 'fixed') {
            product.discountPercentage=discount.discountAmount;
            product.discount=Math.floor((product.price/100) * discount.discountAmount);
           if (product.discount > discount.maximumDiscount) {
                product.discount =Math.floor( discount.maximumDiscount);
            }
        }
        
        res(product);
     });
    }
}

module.exports = {
    fetchAll,
    fetchProducts,
    fetchProductDetails,
    fetchUniqueFields,
    getProductPrice
}