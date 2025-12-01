const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for server-side debugging

    const statusCode = err.statusCode || 200; // Keeping 200 as default to match existing frontend expectations where errors are handled via EC/EM in 200 OK responses, or use 500 if strictly server error. 
    // However, looking at existing code: return res.status(200).json({... EC: -1 ...}) for server errors.
    // So I will default to status 200 but with EC -1, unless a specific status is set.
    
    const errorMessage = err.message || 'Error from server...';

    return res.status(statusCode).json({
        DT: '',
        EC: err.errorCode || -1, 
        EM: errorMessage
    });
};

export default errorMiddleware;
