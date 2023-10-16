const Reviews = require('../models/reviews');

async function fetchReviews(productId) {
    try {
        let reviews = (await Reviews.findOne({ productID: productId })
            .populate({
                path: 'reviews.userId',
                select: 'name'
            })).reviews;

        // getting avg rating
        let avgRating = reviews.reduce((accumulator, current) => {
            return accumulator += current.rating;
        }, 0)


        // reviews = reviews.map((r) => {
        //     // console.log("r is ",r.date," type is ",typeof(r));
        //     console.log((r.date).toString());
        //     r.date = r.date.toString();
        //     console.log(r.date," working");
        //     return r;
        // });

        avgRating /= reviews.length;

        return {
            reviews,
            avgRating
        }

    } catch (error) {
        return {
            reviews: {},
            avgRating: 0
        };
    }
}

module.exports = {
    fetchReviews
}