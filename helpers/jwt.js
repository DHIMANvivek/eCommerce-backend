const jwt = require("jsonwebtoken")
require('dotenv').config()

function verifyToken(token) {
    try {

        console.log(token, "helper tken");
        // const data = token.split(' ')[1] || req.body.tokenData;
        const data = token
        console.log("data is ",data);
        if (!data) {
            throw ({ message: 'token not found' });
        }


        const details = jwt.verify(data, process.env.secretKey);
        console.log("details is ",details)
        return details;


    } catch (error) {
        throw error;
    }
}
function createToken(tokenData) {
    try {

        // { expiresIn: '1000s' }
        const token = jwt.sign(tokenData, process.env.secretKey, );

        return token;

    }
    catch (error) {
        throw error;
    }
}


module.exports = {
    createToken, verifyToken

}
