import reviewService from '../services/reviewService';
import asyncHandler from '../utils/asyncHandler';

const handleCreateReview = asyncHandler(async (req, res) => {
    let reviewData = req.body;
    let response = await reviewService.createReviewService(reviewData);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleUpdateReview = asyncHandler(async (req, res) => {
    let reviewData = req.body;
    console.log('bil', reviewData);
    let response = await reviewService.updateReviewService(reviewData);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleGetReview = asyncHandler(async (req, res) => {
    let type = req.query.type;
    let reviewId = req.query.id;
    let page = req.query.page;
    let pageSize = req.query.pageSize;
    let clothesId = req.query.clothesId;
    let userId = req.query.userId;
    let star = req.query.star;
    let size = req.query.size;
    let response = await reviewService.getReviewService(type, reviewId, page, pageSize, clothesId, userId, size, star);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleDeleteReview = asyncHandler(async (req, res) => {
    let id = req.query.id;
    let response = await reviewService.deleteReviewService(id);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

module.exports = {
    handleCreateReview, handleDeleteReview, handleGetReview, handleUpdateReview
};
