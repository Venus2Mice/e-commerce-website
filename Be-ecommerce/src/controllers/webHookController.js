import webHookService from '../services/webHookService';
import asyncHandler from '../utils/asyncHandler';

const handleGetPayment = asyncHandler(async (req, res) => {
    let webHookData = req.body;
    let response = await webHookService.getPaymentWebHookService(webHookData);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

module.exports = {
    handleGetPayment
};
