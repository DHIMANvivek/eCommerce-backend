const usersModel = require('../models/users');
const leadModel = require('../models/lead');
const {verifyToken}=require('../Helpers/jwt');
async function signup(req, res) {
    try {
        const user= await usersModel.findOne({email:req.body.email});
        if(user){
            throw ({message:'User already exist'});
        }

        const leadFound = await leadModel.findOne({ email: req.body.email });

        const userCreated = await usersModel(req.body);

        if (leadFound) {
            userCreated.Lead = leadFound;
        }

        await userCreated.save();
        res.status(200).json({ success: true });

    } catch (error) {
    
        if(error.message){
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }

}
async function login(req, res) {
    try {
        const input = req.body;
        const userFound = await usersModel.find({
            email : input.email
        })
        if (userFound){
            res.status(200).json({
                message : "Login Successful"
            })
        }
        else {
            res.status(201).json({
                message: "Login Unsuccessful"
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "Error in login controller",
            error
        });
    }
}

module.exports = {
    signup,
    login
}