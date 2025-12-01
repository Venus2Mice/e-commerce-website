import billService from '../services/billService';
import asyncHandler from '../utils/asyncHandler';

const handleCreateBill = asyncHandler(async (req, res) => {
    let billData = req.body;
    let response = await billService.createBillService(billData);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleUpdateBill = asyncHandler(async (req, res) => {
    let billData = req.body;
    console.log('bil', billData);
    let response = await billService.updateBillService(billData);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleGetBill = asyncHandler(async (req, res) => {
    let type = req.query.type;
    let billId = req.query.id;
    let page = req.query.page;
    let pageSize = req.query.pageSize;
    let userId = req.query.userId;
    let status = req.query.status ? req.query.status.split(',') : '';
    let response = await billService.getBillService(type, billId, page, pageSize, userId, status);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

const handleDeleteBill = asyncHandler(async (req, res) => {
    let id = req.query.id;
    let response = await billService.deleteBillService(id);

    return res.status(200).json({
        DT: response.DT,
        EC: response.EC,
        EM: response.EM
    });
});

module.exports = {
    handleCreateBill, handleDeleteBill, handleGetBill, handleUpdateBill
};
