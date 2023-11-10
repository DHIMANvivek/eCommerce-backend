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

        popularQuery = {
            $match: {
                'higlight': true
            }
        }

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

        aggregationPipe.push(
            {
                $sort: { 'name': 1 }
            }
        );

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
            matchedProducts.items = JSON.parse(JSON.stringify(matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) >= minPrice;
            })));
        }
        if (maxPrice) {
            matchedProducts.items = (matchedProducts.items.filter((item) => {
                return (item.discount ? (item.price - item.discount) : item.price) <= maxPrice;
            }));
        }

        if (colors) {
            matchedProducts.items = colorDistance(matchedProducts.items);
        }

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
                if (product.assets.some(asset => {
                    let assetColorRGB = hexToRgb(asset.color);
                    if (colors.some(color => {
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
                })) {
                    return product;
                }
            });

            return products;
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
    const products = await Products.find({});

    function getData(products, parameter = input) {
        const uniqueData = {
            category: [],
            brand: [],
            tags: [],
        }

        let filterObject;

        if (parameter != 'all') {
            // console.log("even here");
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
        return new Promise((res, rej) => {
            res(products);
        })

    } catch (error) {
    }

    async function discountQuery(parameter) {

        let product = JSON.parse(JSON.stringify(parameter));

        product.info.brand = product.info.brand.charAt(0).toUpperCase() + product.info.brand.slice(1);
        product.info.category = product.info.category.charAt(0).toUpperCase() + product.info.category.slice(1);
        return new Promise(async (res, rej) => {

            const allOffers = await OffersModel.find({ OfferType: 'discount', 'status.active': true });
            let discount;
            for (let offer of allOffers) {
                if (offer.ExtraInfo?.brand?.includes([product.info.brand]) && offer.ExtraInfo?.categories?.includes([product.info.category])) {
                    discount = offer;
                    break;
                }

                else if (offer.ExtraInfo?.brand?.includes([product.info.brand]) && !offer.ExtraInfo?.categories?.includes([product.info.category])) {
                    discount = offer;
                }
                else if (!offer.ExtraInfo?.brand?.includes([product.info.brand]) && offer.ExtraInfo?.categories?.includes([product.info.category])) {
                    discount = offer;
                }

            }
            //  discount = await OffersModel.findOne({
            //     $or: [{ 'ExtraInfo': { $exists: false } }, { "ExtraInfo.categories": { $in: [product.info.category] } },
            //     { "ExtraInfo.brands": { $in: [product.info.brand] } },
            //     ], OfferType: 'discount','status.active':true
            // }, { 'discountType': 1, 'discountAmount': 1, 'DiscountPercentageType': 1, 'maximumDiscount': 1, 'OfferType': 1 })

            if (discount == null) {
                res(product);
                return;
            }
            product.discount = discount.discountAmount;
            if (discount.discountType == 'percentage') {
                product.discountPercentage = discount.discountAmount;
                product.discount = Math.floor((product.price / 100) * discount.discountAmount);

                if (product.discount > discount.maximumDiscount) {
                    product.discount = Math.floor(discount.maximumDiscount);
                }



            }

            if (product.discount) {
                product.oldPrice = product.price;
                product.price = (product.price - product.discount) <= 0 ? 0 : (product.price - product.discount)

            }

            // console.log('product discount is ',product.discount," product category is ",product.info.category);
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

module.exports = {
    fetchProducts,
    fetchProductDetails,
    fetchUniqueFields,
    getProductPrice
}