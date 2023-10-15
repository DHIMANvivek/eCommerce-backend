const { verifyToken } = require('../helpers/jwt');

async function JwtVerify(req, res, next) {
    try {
        let data;
        if (req.headers.authorization ){
            data = verifyToken(req.headers.authorization.split(' ')[1])
        }
        else{
            data = verifyToken(req.body.tokenData)
         }
       console.log(data, "jwt cdsccsdvc");
        req.tokenData = data;
        next();
    } catch (error) {
       
        res.status(500).json(error);

    }
}


module.exports = JwtVerify;

