import db from "../models"
import _ from "lodash";
import { Op } from "sequelize";

// Check if user already reviewed the product
const checkValidReview = async (userId, clothesId) => {
    let review = await db.Review.findOne({
        where: { userId: userId, clothesId: clothesId }
    })
    if (review && review.userId) {
        return false; // Already reviewed
    }
    else {
        return true; // Can review
    }
}

const createReviewService = async (reviewData) => {
    try {
        // Basic validation handled by Joi, assuming data is structurally correct here
        let isValid = await checkValidReview(reviewData.userId, reviewData.clothesId);
        if (isValid === false) {
            return {
                DT: '',
                EC: -1,
                EM: 'You have rated this product before!'
            }
        }
        else {
            let review = await db.Review.create({
                star: reviewData.star,
                userId: reviewData.userId,
                clothesId: reviewData.clothesId,
                // billId: reviewData.billId, // Optional or linked logic
                comment: reviewData.content // Mapped from 'content' in schema
            })

            if (reviewData.image) {
                await db.ReviewImage.create({
                    reviewId: review.id,
                    image: reviewData.image
                });
            }

            return {
                DT: review.id,
                EC: 0,
                EM: 'Create review completed!'
            }
        }
    }
    catch (e) {
        console.log(e);
        return {
            DT: '',
            EC: -1,
            EM: 'Err from review service!'
        }
    }
}


const updateReviewService = async (reviewData) => {
    try {
        let review = await db.Review.findOne({
            where: { id: reviewData.id },
        })

        if (review) {
            review.star = reviewData.star;
            review.comment = reviewData.content;
            await review.save();
            
            if (reviewData.image) {
                 // Simple logic: replace existing image or add new. 
                 // For better UX, might want to manage array of images.
                 // Here we wipe and re-add for simplicity of 'update'
                 await db.ReviewImage.destroy({ where: { reviewId: review.id }});
                 await db.ReviewImage.create({
                    reviewId: review.id,
                    image: reviewData.image
                });
            }

            return {
                DT: review.id,
                EC: 0,
                EM: 'Update review completed!'
            }
        } else {
             return {
                DT: '',
                EC: -1,
                EM: 'Review not found!'
            }
        }
    }
    catch (e) {
        console.log(e);
        return {
            DT: '',
            EC: -1,
            EM: 'Err from review service!'
        }
    }
}

const convertBufferToBase64 = (reviewData) => {
    let newData = []
    // Use simple JSON copy to avoid mutating original reference if needed, or just map
    // Deep clone might be safer for complex nested objects from Sequelize
    let dataCopy = JSON.parse(JSON.stringify(reviewData)); 
    
    dataCopy.map(item => {
        if (item.ReviewImages && item.ReviewImages.length > 0) {
            item.ReviewImages.map(item2 => {
                if (item2.image) {
                    item2.image = Buffer.from(item2.image, 'base64').toString('binary');
                }
                return item2;
            })
        }
        newData.push(item);
    })
    return newData
}

const getReviewService = async (type, reviewId, page, pageSize, clothesId, userId, size, star) => {
    try {
        if (!type) {
            return {
                DT: '',
                EC: -1,
                EM: 'Err from review service: missing parameter!'
            }
        }
        else {
            if (type === 'ALL') {
                let review = await db.Review.findAll({
                    where: { clothesId: clothesId },
                    // distinct: true, 
                    include: [
                        {
                            model: db.ReviewImage,
                            order: [['createdAt', 'DESC']],
                        },
                        {
                            model: db.User,
                            attributes: ['firstName', 'lastName', 'avatar']
                        }
                    ]
                })

                let reviewData = convertBufferToBase64(review);

                return {
                    DT: reviewData,
                    EC: 0,
                    EM: 'Get review completed!'
                }

            }
            else if (type === 'PAGINATION') {
                // ... Existing complex logic or simplified ...
                // Keeping simplified for this refactor focus
                 const { count, rows } = await db.Review.findAndCountAll({
                    offset: (+page - 1) * (+pageSize),
                    limit: +pageSize,
                    order: [["id", "DESC"]],
                    where: {
                        star: star ? star : { [Op.ne]: null },
                        clothesId: clothesId,
                    },
                    include: [
                        {
                            model: db.ReviewImage,
                        },
                        {
                            model: db.User,
                            attributes: ['firstName', 'lastName', 'avatar']
                        }
                    ],
                })
                
                let reviewData = convertBufferToBase64(rows);

                return {
                    DT: {
                        rowCount: count,
                        data: reviewData
                    },
                    EC: 0,
                    EM: 'Get review completed!'
                }

            }
            else {
                // Get One specific review? Or review by user for product?
                // Logic: get specific review by ID
                let review = await db.Review.findOne({
                    where: { id: reviewId },
                    include: [
                        { model: db.ReviewImage },
                        { model: db.User, attributes: ['firstName', 'lastName'] }
                    ]
                })
                
                // Handle buffer conversion if review exists
                let data = review ? convertBufferToBase64([review])[0] : null;

                return {
                    DT: data,
                    EC: 0,
                    EM: 'Get review completed!'
                }
            }
        }
    }
    catch (e) {
        console.log(e);
        return {
            DT: '',
            EC: -1,
            EM: 'Err from review service!'
        }
    }
}

const deleteReviewService = async (id) => {
    try {
        if (!id) {
            return {
                DT: '',
                EC: -1,
                EM: 'Missing parameter!'
            }
        }
        else {
            await db.Review.destroy({ where: { id: id } });
            await db.ReviewImage.destroy({ where: { reviewId: id } }); // Clean up images too

            return {
                DT: '',
                EC: 0,
                EM: 'Delete review completed!'
            }
        }
    }
    catch (e) {
        console.log(e);
        return {
            DT: '',
            EC: -1,
            EM: 'Err from review service!'
        }
    }
}

module.exports = {
    createReviewService, getReviewService, updateReviewService, deleteReviewService
}
