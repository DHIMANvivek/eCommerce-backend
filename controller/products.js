const Products = require('../models/products');
const reviewsController = require('../controller/reviews');
const OffersModel = require('../models/offers');
const { verifyToken } = require('../helpers/jwt');
const logger = require('./../logger');

async function fetchProductDetails(req, res, sku = null, admincontroller = null) {
    try {
        let query = {};
        let user;

        if (req.headers.authorization) {
            user = verifyToken(req.headers.authorization.split(' ')[1]);
        }
        if (admincontroller) {
            if (user.role == 'admin') query['sellerID'] = user.id;
        }

        query['sku'] = req.query.sku ? req.query.sku : sku;

        let product = JSON.parse(JSON.stringify(await Products.findOne(
            query,
            {
                status: 0,
                updatedAt: 0
            }
        )));

        if (!product) throw ({ message: 'This Product is not available' });

        product = await getProductPrice((product));
        // getting all the reviews and average
        let reviews_rating;
        if (user) {
            reviews_rating = await reviewsController.fetchReviews(
                product._id,
                user.id
            );
        }
        else {
            reviews_rating = await reviewsController.fetchReviews(
                product._id
            );
        }

        product.avgRating = reviews_rating.avgRating;
        product.reviews = reviews_rating.reviews;

        if (reviews_rating.userReview) {
            product.userReview = reviews_rating.userReview;
        }

        if (req.query.sku && !admincontroller) {
            res.status(200).json(product);
            return;
        }
        return product;

    } catch (error) {
        logger.error(error);
        if (error.message) {
            logger.warn(error.message);
            res.status(404).json(error);
            return;
        }
        logger.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

// exploring, searching and filtering
async function fetchProducts(req, res) {
    try {
        // Search
        let search = req.query.search || '';
        delete req.query.search;

        // minimum and max price
        let minPrice = Number(req.query.minPrice) || '';
        delete req.query.minPrice;
        let maxPrice = Number(req.query.maxPrice) || '';
        delete req.query.maxPrice;

        // colors
        let colors = req.query.color;
        delete req.query.color;

        // aggregation pipe array
        aggregationPipe = [
            {
                $match: {
                    "status.active": true,
                    "status.delete": false
                }
            },
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
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "productID",
                    as: "rating",
                },
            },
            {
                $unwind: {
                    path: "$rating",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    sellerID: { $first: '$$ROOT.sellerID' },
                    sku: { $first: '$$ROOT.sku' },
                    name: { $first: '$$ROOT.name' },
                    assets: { $first: '$$ROOT.assets' },
                    info: { $first: '$$ROOT.info' },
                    price: { $first: '$$ROOT.price' },
                    createdAt: { $first: '$$ROOT.createdAt' },
                    highlight: { $first: '$$ROOT.highlight' },
                    avgRating: {
                        $avg: {
                            $ifNull: [{ $avg: "$rating.reviews.rating" }, 0]
                        }
                    }
                },
            },
        ];

        let priceSortValue;

        if (req.query.sort) {
            let keyCanContain = ['avgRating', 'price', 'createdAt'];
            let key = (req.query.sort).split(':')[0];
            let value = Number((req.query.sort).split(':')[1]);

            //defaults to if some other value is input
            if (!(keyCanContain.includes(key))) {
                key = 'name';
                value = 1;
            }

            if (key == 'price') {
                priceSortValue = value
            }
            else {
                aggregationPipe.push({
                    $sort: { [key]: value }
                });
            }

            delete req.query.sort;
        }
        else {
            aggregationPipe.push({
                $sort: { 'name': 1 }
            })
        }


        let limit = Number(req.query.limit) || '';
        let page = Number(req.query.page) || 1;
        let skip = (page - 1) * limit;

        if (req.query.limit) delete req.query.limit;
        if (req.query.page) delete req.query.page;

        if ((Object.keys(req.query)).length > 0) {

            aggregationPipe.unshift(
                {
                    $match: getFilterQuery(req.query)
                }
            )
        }

        let matchedProducts = {
            total: 0
        };

        // fetching the data
        let products = await Products.aggregate(aggregationPipe);
        matchedProducts.items = await getProductPrice((products));

        if (priceSortValue) {
            matchedProducts.items = matchedProducts.items.sort((a, b) => {
                if (a.price < b.price) {
                    return -1 * priceSortValue;
                }
                if (a.price > b.price) {
                    return 1 * priceSortValue;
                }
                return 0;
            });
        }
        if (minPrice) {
            matchedProducts.items = JSON.parse(JSON.stringify(matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) >= minPrice;
            })));
        }
        if (maxPrice) {
            matchedProducts.items = (matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) <= maxPrice;
            }));
        }

        // check for in stock variant
        matchedProducts.items = matchedProducts.items.map(item => {
            let matchedIndex = 0;
            let colorMatched = item.assets.some(asset => {
                if(sizeVariantMatched(asset)){
                    return true;
                }
                matchedIndex++;
                return false;
            });

            if (colorMatched && matchedIndex > 0) {
                item.matchedIndex = matchedIndex;
            }

            return item;
        });

        function sizeVariantMatched(asset) {
            return asset.stockQuantity.some(stockQ => {
                if (stockQ.quantity > 0) return true;
            });
        }

        if (colors) {
            matchedProducts.items = colorDistance(matchedProducts.items);
        }
        matchedProducts.total = matchedProducts['items'].length;
        if (limit) {
            matchedProducts.items = matchedProducts.items.splice(skip, limit);
        }


        res.status(200).json(matchedProducts);

        // filter aggregation query helper function
        function getFilterQuery(parameters) {
            const keys = Object.keys(parameters);
            const query = [];

            keys.forEach((key) => {
                if (Array.isArray(parameters[key])) {
                    if (key === 'size') {
                        const sizeConditions = parameters[key].map(size => ({
                            'assets.stockQuantity.size': { $regex: new RegExp(`^${size}$`, 'i') }
                        }));
                        query.push({ $or: sizeConditions });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $in: parameters[key].map(value => new RegExp(`^${value}$`, 'i')) } });
                    }
                } else {
                    if (key === 'size') {
                        query.push({ [`assets.stockQuantity.size`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                }
            });

            return { $and: query };
        }

        // find matching nearby colors
        function colorDistance(products) {
            if (!(Array.isArray(colors))) {
                let color = colors;
                colors = [];
                colors.push(color);
            }

            products = products.filter((product) => {
                let assetIndex = -1;
                const matchColorExists = product.assets.some(asset => {
                    assetIndex++;
                    let assetColorRGB = hexToRgb(asset.color);
                    if (
                        colors.some(color => {
                            let colorRGB = hexToRgb(color);
                            let eucleadianDistance = Math.sqrt(Math.pow((colorRGB.r - assetColorRGB.r), 2) + Math.pow((colorRGB.g - assetColorRGB.g), 2) + Math.pow((colorRGB.b - assetColorRGB.b), 2))

                            if (eucleadianDistance <= 120) {
                                return true;
                            }
                            return false;
                        })) {
                        return true;
                    }
                    return false;
                });

                if (matchColorExists) {
                    product.matchedIndex = assetIndex;
                    return product;
                }

            });

            return products;
        }

    } catch (error) {
        logger.error(error);
        console.log(error)
        res.status(500).json({
            message: 'Unable to fetch Products'
        });
    }
}

async function fetchUniqueFields(req, res) {
    const input = req.body.parameter;
    const products = await Products.find({});

    function getData(products, parameter = input) {
        const uniqueData = {
            gender: [],
            brand: [],
            category: [],
            // tags: [],
        }

        let filterObject;

        if (parameter != 'all') {
            filterObject2 = { male: JSON.parse(JSON.stringify(uniqueData)), female: JSON.parse(JSON.stringify(uniqueData)) };
        }
        else {
            filterObject = uniqueData;
        }

        products.forEach((data) => {
            if (parameter != 'all') {
                if (data.info.gender == 'male') {
                    filterObject = filterObject2.male;
                }
                else {
                    filterObject = filterObject2.female;
                }
            }

            for (let filter in (filterObject)) {
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
                        if (!arr.includes(v.toLowerCase())) {
                            arr.push(v.toLowerCase());
                        }
                    }
                }
                else {
                    const arr = filterObject[filter];
                    if (!arr.includes(value.toLowerCase())) {
                        arr.push(value.toLowerCase());
                    }
                }
            }

        });

        if (parameter != 'all') {
            return filterObject2;
        }
        return uniqueData;
    }

    const data = getData(products, input);
    res.status(200).json({ data });
}

async function getProductPrice(products) {
    try {

        if (!Array.isArray(products)) {
            discount = await discountQuery(products);
            products = await discountQuery(products);
        }
        else {

            products = await Promise.all(products.map(async (product) => {
                if (!(product.info)) {
                    product = await Products.findOne({ sku: product.sku });
                }
                product = await discountQuery(product);
                return product;
            }))

        }
        return new Promise((res, rej) => {
            res(products);
        })

    } catch (error) {
        logger.error(error);
    }

    async function discountQuery(parameter) {
        let product = JSON.parse(JSON.stringify(parameter));
        // product.info.brand = (product.info.brand).toupp();
        let brandArr=product.info.brand=product.info.brand.split(' ');
        let brand='';
        brandArr.forEach((el,index)=>{
            brand+=el.charAt(0).toUpperCase() + el.slice(1);
            if(index<brandArr.length-1) brand+=' ';
        })
        product.info.brand=brand;
        return new Promise(async (res, rej) => {

            let discount;
            let offer = await OffersModel.findOne({ OfferType: 'discount', 'ExtraInfo.brands': product.info.brand, 'ExtraInfo.categories': product.info.category, 'status.active': true, 'status.deleted': false, startDate: { $lte: new Date() } });

            if (!offer) {
                offer = await OffersModel.findOne({ OfferType: 'discount', 'ExtraInfo.brands': product.info.brand, 'ExtraInfo.categories': null, 'status.active': true, 'status.deleted': false, startDate: { $lte: new Date() } });
                if (!offer) {
                    let offer = await OffersModel.findOne({ OfferType: 'discount', 'ExtraInfo.brands': null, 'ExtraInfo.categories': product.info.category, 'status.active': true, 'status.deleted': false, startDate: { $lte: new Date() } });

                    if (!offer) {
                        let offer = await OffersModel.findOne({ OfferType: 'discount', 'ExtraInfo.brands': null, 'ExtraInfo.categories': null, 'status.active': true, 'status.deleted': false, startDate: { $lte: new Date() } });
                        discount = offer;
                    }
                    else {
                        discount = offer;
                    }
                }
                else {
                    discount = offer;

                }

            }

            else {
                discount = offer;
            }
            if (discount == null) {
                res(product);
                return;
            }

            product.discount = discount.discountAmount;
            if (product.price - discount.discountAmount <= 0) {
                product.discount = 0;
                res(product);
            }
            if (discount.discountType == 'percentage') {
                product.discountPercentage = discount.discountAmount;

                product.discount = Math.floor((product.price / 100) * discount.discountAmount);
                if (product.discount > discount.maximumDiscount) {
                    product.discount = Math.floor(discount.maximumDiscount);
                    product.discountPercentage = Math.floor((product.discount * 100) / product.price);
                }

            }

            if (product.discount) {
                product.oldPrice = product.price;
                product.price = (product.price - product.discount)

            }


            res(product);
        });
    }
}


const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
}

async function ReduceProductQuantity(products) {

    try {
        products.forEach(async (el) => {
            const findQuantity = await Products.findOne({
                sku: el.sku,
                'assets.color': el.color,
                'assets.stockQuantity.size': el.size
            }, { 'assets.stockQuantity.quantity': 1, _id: 0 });

            if (el.quantity > findQuantity) { throw { message: 'Sorry given Product Quantity is not available' } }
            // if(el.quantity>=findQuantity) el.quantity=findQuantity;
            else el.quantity = el.quantity;
            const updateProduct = await Products.updateOne(
                {
                    sku: el.sku,
                    'assets.color': el.color,
                    'assets.stockQuantity.size': el.size
                },

                {
                    $inc: { 'assets.$[outer].stockQuantity.$[inner].quantity': -el.quantity, 'assets.$[outer].stockQuantity.$[inner].unitSold': el.quantity },
                },
                {
                    arrayFilters: [
                        { "outer.color": el.color },
                        { "inner.size": el.size }
                    ]
                }
            );
        })
    } catch (error) {
        logger.error(error);
    }
}
module.exports = {
    fetchProducts,
    fetchProductDetails,
    fetchUniqueFields,
    getProductPrice,
    ReduceProductQuantity
}