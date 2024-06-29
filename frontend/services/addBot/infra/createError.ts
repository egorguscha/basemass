const createError = (statusCode, message) => {
    return {
        status: statusCode,
        json: {
            error: message
        }
    };
};

export default createError;
