const Products = require('../models/products');
const reviewsController = require('../controller/reviews');
const OffersModel=require('../models/offers');
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
async function fetchProductDetails(req, res, sku = null) {
    try {

        let query = {};
        if (req.headers.authorization){
            data = verifyToken(req.headers.authorization.split(' ')[1])
            if (data.role == 'admin') query['sellerID'] = data.id;
        }
        query['sku'] = req.query.sku ? req.query.sku : sku;

        let product = JSON.parse(JSON.stringify(await Products.findOne(query)));

        // getting all the reviews and average
        let reviews_rating = await reviewsController.fetchReviews(product._id);
        product.avgRating = reviews_rating.avgRating;
        product.reviews = reviews_rating.reviews;

        if(req.query.sku){
            res.status(200).json(product);
            return;
        }
        return product;

    } catch (error) {
        res.status(500).json({
            message: 'This Product is not available'
        });
    }
}

// exploring, searching and filtering
async function fetchProducts(req, res) {
    try {
        // Pagination, fixed limit to showing only 8 product at a time

        req.query = req.query ? req.query : req.body;

        console.log(req.query);
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

        // calculating total items and getting avg reviews
        matchedProducts.items = await Promise.all(products.map(async (product) => {
            product.avgRating = (await reviewsController.fetchReviews(product._id)).avgRating;
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
        res.status(500).json({
            message: 'Unable to fetch Products'
        });
    }
}

async function fetchUniqueFields(req, res) {
    try {
        const parameter = req.body.parameter;
        // console.log(parameter, "param");
        const products = await Products.find({});
    
        function getData(products, parameter) {
    
            const uniqueData = {
                category: [],
                price: [],
                brand: [],
                tags: [],
            }
    
            let filterObject;
    
            if (parameter != 'all') {
                filterObject2 = {
                    male: {
                        category: [],
                        price: [],
                        brand: [],
                        tags: [],
                    }, female: {
                        category: [],
                        price: [],
                        brand: [],
                        tags: [],
                    }
                };
                aa = 20;
                // console.log(filterObject, "male femle");
            }
            else {
                filterObject = uniqueData;
                // console.log(filterObject, "filter obj");
            }
    
            products.forEach((data) => {
    
                if (parameter != 'all') {
    
                    // console.log('filterObject EVERY TIME IS  ',filterObject);
                    if (data.info.gender == 'male') {
                        // console.log("male");/
                        // a=aa;
                        filterObject = filterObject2.male; // object  male: uniqueData, female: uniqueData }  
                    }
                    else {
                        // console.log("female  ",filterObject.female);
                        filterObject = filterObject2.female;
                    }
                }
                for (let filter in filterObject) {
    
                    // console.log(filter, "filterrr")
                    if (filter in data) {
                        target = data;
                    }
                    else {
                        target = data.info;
                    }
    
                    const value = target[filter];
    
                    // console.log('value is ',value);
                    if (Array.isArray(value)) {
                        for (let v of value) {
                            const arr = filterObject[filter];
                            // console.log('v is ', v, " arr is ", arr);
                            if (!filterObject[filter].includes(v)) {
                                // arr.push(v);
                                filterObject[filter].push(v);
                            }
                        }
                    }
                    else {
                        filterObject[filter];

                        // console.log(arr, "array ", filter, "------filter");
                        if (!filterObject[filter].includes(value)) {
                            filterObject[filter].push(value);
                        }
                    }
                }
                // return uniqueData;
            });
    

            let sizes=['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
            if (parameter != 'all') {
                // console.log('filter data is ',filterObject2);
                filterObject2.male.sizes=sizes;
                filterObject2.female.sizes=sizes;
                // filterObject2.data.male.sizes=sizes;
                // filterObject2.data.female.sizes=sizes;
                return filterObject2;
            }

            else {
                // filterObject2.male.sizes=sizes;
                // filterObject2.female.sizes=sizes;
                filterObject.sizes=sizes;
                return filterObject;}
        }
    
        const data = getData(products, parameter);
        // console.log('DATA IS ',data);rs
        res.status(200).json({ data });   
    }
    catch (error) {
        console.log("errror", error);
    }
}

async function fetchUnique(req, res) {
    
    try {

    }
    catch {

    }
}




function helper(Array, productPrice) {
    let productDiscount = 0;
    Array.forEach((element) => {
        if (element.discountType == 'percentage') {
            let discountPrice = Math.ceil((productPrice * element.discountAmount) / 100);
            if (discountPrice > productDiscount) {
                productDiscount = discountPrice;
            }
        }
        else {
            if (element.discountAmount > productDiscount) productDiscount = element.discountAmount;
        }
    })

    return productDiscount;
}


async function getProductPrice(req, res) {
    try {
        let productDiscount;
        let productCategory = 'Kurti';
        let productPrice = 1000;
        let productBrand = 'Sangria';
        let globalDiscounts = await OffersModel.find({ 'ExtraInfo': { $exists: 0 } }, { 'discountType': 1, 'discountAmount': 1 });
        productDiscount = helper(globalDiscounts, productPrice);
        let anotherDiscount = await OffersModel.find(
            { "ExtraInfo.categories": { $in: [productCategory] } }, { 'discountType': 1, 'discountAmount': 1 });
        let result = helper(anotherDiscount, productPrice);
        if (result > productDiscount) productDiscount = result;



        res.status(200).json(productDiscount);

    } catch (error) {
        res.status(500).json(error);
    }
}


module.exports = {
    fetchAll,
    fetchProducts,
    fetchProductDetails,
    fetchUniqueFields,
    getProductPrice
} 
