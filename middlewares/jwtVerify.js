const { verifyToken } = require('../helpers/jwt');

function JwtVerify(req, res, next) {
    try {
        let data;
        if (req.headers.authorization){
            data = verifyToken(req.headers.authorization.split(' ')[1])
        }
        else{
            data = verifyToken(req.body.tokenData)
        }
        req.tokenData = data;
        next();
    } catch (error) {
        res.status(500).json(error);

    }
}

 function CheckUser(req,res){
    try {
        let data;
        if (req.headers.authorization){
            data = verifyToken(req.headers.authorization.split(' ')[1])
        }
        console.log('data come up is ',data);
        req.tokenData = data;
        // next();
    } catch (error) {
        res.status(500).json(error);

    }
}




module.exports = JwtVerify;