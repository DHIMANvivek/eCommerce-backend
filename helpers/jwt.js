async function verifyToken(token){
try {
    const token = req.headers?.authorization?.split(' ')[1] || req.body.resetToken;
    if(!token){
        throw ({message:'token not found'});
    }


    const details = jwt.verify(token, SECRET_KEY);
    return details;
        

} catch (error) {
    throw error;
}
}


module.exports={
    verifyToken
};