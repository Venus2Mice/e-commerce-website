import Joi from 'joi';

const createReviewSchema = Joi.object({
    clothesId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(), // Ideally this comes from the token, but for now we might accept it if the service requires it explicitly, though req.user is better. Let's stick to body for now if controller expects it.
    content: Joi.string().required(),
    star: Joi.number().integer().min(1).max(5).required(),
    image: Joi.string().allow('', null) // Optional image URL/Base64
});

const updateReviewSchema = Joi.object({
    id: Joi.number().integer().required(),
    content: Joi.string().required(),
    star: Joi.number().integer().min(1).max(5).required(),
    image: Joi.string().allow('', null)
});

export default {
    createReviewSchema,
    updateReviewSchema
};
