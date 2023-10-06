const {verifyToken}=require('../helpers/jwt');


async function JwtVerify(req,res,next){
    console.log("inside jwtverify");
    try {
        console.log("INSIDE TRY ");
       const data= verifyToken(req.headers.token)
 } catch (error) {
       
        res.status(500).json(error);

    }
}


module.exports=JwtVerify

