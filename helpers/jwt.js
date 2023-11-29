const jwt = require("jsonwebtoken");
require('dotenv').config()
const logger = require('./../logger');

function verifyToken(token) {
    try {
        const data = token;
        if (!data) {
            throw ({ message: 'Please login/signup.' });
        }
        const details = jwt.verify(data, process.env.secretKey);
        return details;
        
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
function createToken(tokenData) {
    try {

        // { expiresIn: '1000s' }
        const token = jwt.sign(tokenData, process.env.secretKey);

        return token;

    }
    catch (error) {
        logger.error(error);
        throw error;
    }
}


module.exports = {
    createToken, verifyToken
}
