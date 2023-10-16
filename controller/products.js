const Products = require('../models/products');
const reviewsController = require('../controller/reviews');


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
async function fetchProductDetails(req, res) {
    try {
        let query = {
            sku: req.query.sku
        }
        let product = JSON.parse(JSON.stringify(await Products.findOne(query)));

        // getting all the reviews and average
        let reviews_rating = await reviewsController.fetchReviews(product._id);
        product.avgRating = reviews_rating.avgRating;
        product.reviews = reviews_rating.reviews;

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: 'This Product is not available'
        });
    }
}




// exploring, searching and filtering
async function fetchProducts(req, res) {
    try {
        //pagination, fixed limit to showing only 9 product at a time
        let limit = 8;
        let page = req.query.page || 1;
        let skip = (page - 1) * limit;
        delete req.query.page;

        //aggregation pipe array
        aggregationPipe = [
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

async function fetchUniqueCategories(req, res){
    const products = await Products.find({});
    console.log('INSIDE FETCH UNIQUE');
   function getData(products) {


        //    products.map((originalData)=>{
            // console.log('ORINGAL DATA IS ',originalData);
            const filterObj = {
              size: [],
              color: [],
              category: [],
              price: [],
              brand: [],
              tags: []
            };
        
            products.forEach((data) => {
            
              
              
              for (let filter in (filterObj)) {
                // console.log('filter is ',filter,filter in data);
                
                // console.log('FILTER IS ',filter ," filteranswe is ",(filter in data.assets));
                // const target = filter in data ? data : data.info;
                if(filter in data){
                    target=data;
                }

               
                // else if(filter in data.assets){
                //     target=data.assets;
                //     console.log('target is ',target);
                // }

                else{
                    target=data.info;
                }
            
                const value = target[filter];
          
                if (Array.isArray(value)) {
             
                  
                  for (let v of value) {
              
                    
                    const arr = filterObj[filter];
                   
                    if (!arr.includes(v)) {
                      arr.push(v);
                    }
    
    
                    // console.log("arr is ",arr, " vi s ",v )
                  }
                }
                else {
                  const arr = filterObj[filter];
                  if (!arr.includes(value)) {
                    arr.push(value);
                  }
                }
              }
            });
        
            // Object.keys(filterObj).forEach(el => {
            
            //   if (filterObj[el].length > 3) {
               
            //   }
            // });
    
        
         
            let result=filterObj;
            // resolve(result);
    
        //   })  
        

        return result;
    
        // return promise;
      }

    const data=  getData(products);
      console.log('data is ',data);
      res.status(200).json({message:"sucess"});
}

module.exports = {
    fetchAll,
    fetchProducts,
    fetchProductDetails,
    fetchUniqueCategories
}