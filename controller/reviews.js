const Reviews = require('../models/reviews');

async function fetchReviews(productId, userId = '') {
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

        avgRating /= reviews.length;
        avgRating = parseFloat(avgRating.toFixed(1));

        let userReview;
        if (userId) {
            reviews = (reviews.filter((review) => {
                if (review.userId._id != userId) {
                    return review;
                }
                userReview = review;
            }));
        }

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

async function addOrUpdateReview(req, res) {
    try {
        const userId = req.tokenData.id;
        const input = req.body;

        const existingReview = await Reviews.findOne({
            productID: input.productId,
            'reviews.userId': userId
        });

        if (existingReview) {
            // User already has a review, update it
            await Reviews.updateOne(
                {
                    productID: input.productId,
                    'reviews.userId': userId
                },
                {
                    $set: {
                        'reviews.$.rating': input.rating,
                        'reviews.$.comment': input.comment
                    }
                }
            );
            res.status(200).json({
                message: 'Review successfully updated'
            });

        }
        else {
            // User dpes'nt has a review, add it
            await Reviews.updateOne(
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
                { upsert: true }
            );
            res.status(200).json({
                message: 'Review successfully added'
            });
        }


    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteReview(req, res) {
    try {
        const userId = req.tokenData.id;
        const productId = req.query.productId;
        await Reviews.updateOne(
            { productID: productId },
            {
                $pull: {
                    reviews: { userId: userId }
                }
            }
        );

        res.status(201).json({
            message: 'Review successfully deleted'
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// //bulk temp
// async function putReviews(req, res) {
//     console.log(req.body);
//     Reviews.insertMany(req.body);
// }

module.exports = {
    fetchReviews,
    addOrUpdateReview,
    deleteReview
}