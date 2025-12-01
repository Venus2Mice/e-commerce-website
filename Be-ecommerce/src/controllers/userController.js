import userService from '../services/userService'
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from '../utils/asyncHandler';

const handleGetUser = asyncHandler(async (req, res) => {
    let type = req.query.type;
    let userId = req.query.id;
    let response = await userService.getUserService(type, userId);
    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        })
    }
    else {
        return res.status(200).json({
            DT: '',
            EC: -1,
            EM: "err from sever controller..."
        })
    }
});

const handleRegister = asyncHandler(async (req, res) => {
    let data = req.body;
    let response = await userService.registerService(data);

    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        })
    }
    else {
        return res.status(200).json({
            DT: '',
            EC: -1,
            EM: "err from sever controller..."
        })
    }
});

const handleLogin = asyncHandler(async (req, res) => {
    let loginAcc = req.body.loginAcc;
    let password = req.body.password;

    let response = await userService.loginService(loginAcc, password);
    if (response) {

        console.log('res', response.DT.token);
        res.cookie("user", response.DT.token, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'Strict'
        }).status(200).json({
            DT: response.DT.data,
            EC: response.EC,
            EM: response.EM
        });


    }
    else {
        return res.status(200).json({
            DT: '',
            EC: -1,
            EM: "err from sever controller..."
        })
    }
});

const handleCreateItem = asyncHandler(async (req, res) => {
    console.log('create completed');
    return res.status(200).json({
        DT: '',
        EC: -0,
        EM: "Create conpleted..."
    })
});

const handleAccount = asyncHandler(async (req, res) => {
    return res.status(200).json({
        DT: '',
        EC: 0,
        EM: "Check account completed!"
    })
});

const handleUpdateUser = asyncHandler(async (req, res) => {
    let data = req.body;
    let response = await userService.updateUserService(data);
    if (response) {
        return res.status(200).json({
            DT: response.DT,
            EC: response.EC,
            EM: response.EM
        })
    }
    else {
        return res.status(200).json({
            DT: '',
            EC: -1,
            EM: "err from sever controller..."
        })
    }
});

const handleGetRoomId = (req, res) => {
    const randomGenUniqueName = uuidv4();
    return res.status(200).json({
        roomUrl: randomGenUniqueName
    });
}

module.exports = {
    handleGetUser, handleRegister, handleLogin, handleCreateItem,
    handleAccount, handleUpdateUser, handleGetRoomId
}