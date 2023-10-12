const { verifyToken } = require('../helpers/jwt');

async function AdminVerify(req, res, next) {
    try {
        let data;

        console.log("req.headers token ",req.headers.authorization);
        if (req.headers.authorization ){

            data = verifyToken(req.headers.authorization.split(' ')[1])
        }
        else{
            data = verifyToken(req.body.tokenData)
         }
       
        // console.log("Req object is ",request);
         console.log("data coming is ",data);
         res.status(200).json(data);
         return;
        req.tokenData = data;
        next();
    } catch (error) {
       
        res.status(500).json(error);

    }
}


module.exports = AdminVerify;

