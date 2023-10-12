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
         if(data.role=='user') {
            throw ({message:'You are not eligible for this route'});
         }
        
        req.tokenData = data;
        res.status(200).json("welcome");
        next();
    } catch (error) {
       
        res.status(500).json(error);

    }
}


module.exports = AdminVerify;

