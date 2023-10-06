async function verifyToken(token){
try {
    const token = req.headers?.authorization?.split(' ')[1] || req.body.resetToken;
    if(!token){
        throw ({message:'token not found'});
    }

    const details = jwt.verify(token, SECRET_KEY,(error,data)=>{
        if(error){
            throw({message:'token not verified'});
        }

        req.body.email=data.email;
        
        next();
        
    });

} catch (error) {

    if(error.message){
        res.status(500).json(error);
        return;
    }

    // res.status().json(error);

}
}


module.exports={
    verifyToken
};