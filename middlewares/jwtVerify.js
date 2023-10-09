const { verifyToken } = require('../helpers/jwt');

async function JwtVerify(req, res, next) {
    try {
        const data = verifyToken(req.headers.token)
        // console.log("jwt verify data", data);
        req.tokenData = data;
        next();
    } catch (error) {
        console.log('ERROR IS ', error);
        res.status(500).json(error);

    }
}


module.exports = JwtVerify

