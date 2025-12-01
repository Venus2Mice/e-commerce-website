import clothesService from '../services/clothesService';
import asyncHandler from '../utils/asyncHandler';

const handleCreateClothes = asyncHandler(async (req, res) => {
    let data = req.body;

    let response = await clothesService.createClothesService(data);

    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        });
    }
});

const handleGetClothes = asyncHandler(async (req, res) => {
    let type = req.query.type;
    let id = req.query.id;
    let page = req.query.page;
    let pageSize = req.query.pageSize;
    let clothesType = req.query.clothesType ? req.query.clothesType.split(',') : '';
    let category = req.query.category ? req.query.category.split(',') : '';
    let size = req.query.size ? req.query.size.split(',') : '';
    let color = req.query.color ? req.query.color.split(',') : '';
    let priceRange = req.query.priceRange ? req.query.priceRange.split(',') : '';
    let keyWord = req.query.keyWord ? req.query.keyWord.split(' ') : '';
    if (priceRange) {
        priceRange = priceRange.map(item => {
            return (+item + (+item * 0.1));
        });
    }

    console.log(type, id, page, pageSize, clothesType, category, size, color, priceRange, keyWord);
    let response = await clothesService.getClothesService(type, id, page, pageSize, clothesType, category, size, color, priceRange, keyWord);

    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        });
    }
});

const handleUpdateClothes = asyncHandler(async (req, res) => {
    let type = req.body.type;
    let data = req.body.data;
    let response = await clothesService.updateClothesService(type, data);
    if (response) {
        setTimeout(() => {
            return res.status(200).json({
                DT: response.DT,
                EC: response.EC,
                EM: response.EM
            });
        }, 2000);
    }
});

const handleDeleteClothes = asyncHandler(async (req, res) => {
    let id = req.query.id;
    console.log('id', id);
    let response = await clothesService.deleteClothesService(id);

    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        });
    }
});

module.exports = {
    handleCreateClothes, handleGetClothes, handleUpdateClothes, handleDeleteClothes
};
