const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            // Return standardized error response
            return res.status(400).json({
                DT: '',
                EC: -1,
                EM: errorMessage
            });
        }
        
        next();
    };
};

export default validate;
