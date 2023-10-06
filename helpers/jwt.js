const jwt = require("jsonwebtoken")
require('dotenv').config()



 function verifyToken(token){
try {

    console.log("token is ",token);
    // return token;
    const data = token.split(' ')[1];
    if(!data){
        throw ({message:'token not found'});
    }


    const details = jwt.verify(data, process.env.secretKtey);
    return details;
        

} catch (error) {
    throw error;
}
 }

function createToken(tokenData) {
    try {
        const token = jwt.sign(tokenData, process.env.secretKey, { expiresIn: '1000s' });

        return token;

    }
    catch (error) {
        throw error;
    }
}


module.exports = {
    createToken, verifyToken

}
