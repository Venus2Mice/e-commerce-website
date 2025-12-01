import Joi from 'joi';

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().required(), // Could add regex for phone validation if needed
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().allow('', null),
    groupId: Joi.number().integer().allow(null),
    avatar: Joi.string().allow('', null) // Expecting base64 string or url
});

const loginSchema = Joi.object({
    loginAcc: Joi.string().required(),
    password: Joi.string().required()
});

const updateUserSchema = Joi.object({
    id: Joi.number().integer().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    gender: Joi.string().allow('', null),
    groupId: Joi.number().integer().allow(null),
    avatar: Joi.string().allow('', null),
    birthDay: Joi.string().allow('', null),
    address: Joi.object({
        provinceId: Joi.number().allow(null, 0),
        districtId: Joi.number().allow(null, 0),
        wardId: Joi.number().allow(null, 0),
        note: Joi.string().allow('', null)
    }).required()
});

export default {
    registerSchema,
    loginSchema,
    updateUserSchema
};
