const Products = require('../models/products');
const reviewsController = require('../controller/reviews');
const OffersModel = require('../models/offers');
const { verifyToken } = require('../helpers/jwt');

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
                active: 0,
                updatedAt: 0
            }
        )));

        // console.log(product, "product")


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

        if (req.query.sku) {
            res.status(200).json(product);
            return;
        }
        return product;

    } catch (error) {
        console.log('error is ', error);
        if (req.query.sku) {
            res.status(500).json({
                message: 'This Product is not available'
            });
        }
        throw 404;
    }
}

// exploring, searching and filtering
async function fetchProducts(req, res) {
    try {
        req.query = req.query ? req.query : req.body;

        // Search
        let search = req.query.search || '';
        delete req.query.search;

        let minPrice = Number(req.query.minPrice) || '';
        delete req.query.minPrice;

        let maxPrice = Number(req.query.maxPrice) || '';
        delete req.query.maxPrice;

        // aggregation pipe array
        aggregationPipe = [
            {
                $match: {
                    "active": true
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
                key = 'createdAt';
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


        let limit = Number(req.query.limit) || '';
        let page = Number(req.query.page) || 1;
        let skip = (page - 1) * limit;

        if (req.query.limit) {

            // if(!(minPrice || maxPrice)){
            //     aggregationPipe.push({
            //         $skip: skip
            //     });
            //     aggregationPipe.push({
            //         $limit: limit
            //     });
            // }

            delete req.query.limit;
            delete req.query.page;
        }
        if (req.query.page) delete req.query.page;

        if ((Object.keys(req.query)).length > 0) {
            aggregationPipe.unshift(
                {
                    $match: getFilterQuery(req.query)
                })
        }

        let matchedProducts = {
            total: 0
        };

        // fetching the data
        let products = await Products.aggregate(aggregationPipe);
        matchedProducts.total = products.length;
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
            console.log('min is ', minPrice);
            matchedProducts.items = JSON.parse(JSON.stringify(matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) >= minPrice;
            })));

        }
        if (maxPrice) {
            console.log('max is ', maxPrice);
            matchedProducts.items = (matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) <= maxPrice;
            }));
        }


        if (limit) {
            matchedProducts.items = matchedProducts.items.splice(skip, limit);
        }

        console.log(matchedProducts);
        res.status(200).json(matchedProducts);

        // new
        function colorDifference() {

        }

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
                    else if (key === 'size') {
                        const sizeConditions = parameters[key].map(size => ({
                            'assets.stockQuantity.size': { $regex: new RegExp(`^${size}$`, 'i') }
                        }));
                        query.push({ $or: sizeConditions });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $in: parameters[key].map(value => new RegExp(`^${value}$`, 'i')) } });
                    }
                } else {
                    if (key === 'color') {
                        query.push({ [`assets.color`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                    else if (key === 'size') {
                        query.push({ [`assets.stockQuantity.size`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                    else {
                        query.push({ [`info.${key}`]: { $regex: new RegExp(`^${parameters[key]}$`, 'i') } });
                    }
                }
            });

            return { $and: query };
        }

    } catch (error) {
        console.log('error coming is ', error);
        res.status(500).json({
            message: 'Unable to fetch Products'
        });
    }
}

async function fetchUniqueFields(req, res) {
    const input = req.body.parameter;
    console.log(input, "nv inout");
    const products = await Products.find({});

    function getData(products, parameter = input) {
        console.log(parameter, "parameter");
        const uniqueData = {
            category: [],
            brand: [],
            tags: [],
        }

        let filterObject;

        if (parameter != 'all') {
            console.log("even here");
            filterObject2 = { male: uniqueData, female: uniqueData };
        }
        else {
            filterObject = uniqueData;
        }

        products.forEach((data) => {

            if (parameter != 'all') {
                ;
                if (data.info.gender == 'male') {
                    a = aa;
                    filterObject = filterObject2.male;
                }
                else {
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
        });
        console.log(uniqueData, "unique");
        return uniqueData;
    }

    const data = getData(products, 'all');
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


        /* 
        offers.aggregrate([
            $match:product.id,
            
        ])


        */
        return new Promise((res, rej) => {
            res(products);
        })

    } catch (error) {
        res.status(500).json(error);
    }

    async function discountQuery(parameter) {

        let product = JSON.parse(JSON.stringify(parameter));

        return new Promise(async (res, rej) => {
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
            // if(product.discount){
            //     product.oldPrice=product.price;
            //     product.price=product.price-product.discount;

            // }
            if (discount.discountType == 'percentage' && discount.DiscountPercentageType == 'fixed') {

                product.discountPercentage = discount.discountAmount;
                product.discount = Math.floor((product.price / 100) * discount.discountAmount);

                if (product.discount > discount.maximumDiscount) {
                    product.discount = Math.floor(discount.maximumDiscount);
                }



            }


            if (product.discount) {
                product.oldPrice = product.price;
                product.price = product.price - product.discount;

            }

            // console.log('product come is-----> ',product);

            res(product);
        });
    }
}

module.exports = {
    fetchProducts,
    fetchProductDetails,
    fetchUniqueFields,
    getProductPrice
}