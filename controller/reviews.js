const Reviews = require('../models/reviews');
const mongoose = require('mongoose');
const {verifyToken} = require('./../helpers/jwt')

async function fetchReviews(productId, userId = '') {
    try {
        let reviews = (await Reviews.findOne({ productID: productId })
            .populate({
                path: 'reviews.userId',
                select: 'name'
            })).reviews;
            

            let userReview;
            if(userId){
                reviews = (reviews.filter((review)=>{ 
                    if(review.userId._id != userId) {
                        return review;
                    }
                    userReview = review;
                }));
            }

            // console.log(userReview, 'Users review here', );

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
            avgRating,
            userReview
        }

    } catch (error) {
        return {
            reviews: {},
            avgRating: 0
        };
    }
}


// incomplete

async function addReview(req, res) {
    try {
        const userId = req.tokenData.id;
        const input = req.body;
        console.log(input, userId, 'add');

        const existingReview = await Reviews.findOne({
            productID: input.productId,
            'reviews.userId': userId
        });

        if (existingReview) {
            res.status(400).json({ message: 'User has already reviewed this product' });
            return;
        }

        const result = await Reviews.findOneAndUpdate(
            { productID: input.productId },
            {
                $push: {
                    reviews: {
                        userId: userId,
                        rating: input.rating,
                        comment: input.comment
                    }
                }
            },
            { new: true }
        );

        console.log('result coming is ', result);
        res.status(200).json(result);

    } catch (error) {
        console.log('error is ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteReview(req, res) {

}

//bulk temp
async function putReviews(req, res) {
    console.log(req.body);
    Reviews.insertMany(req.body);
}

module.exports = {
    fetchReviews,
    addReview,
    deleteReview
}