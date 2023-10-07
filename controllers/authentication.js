const usersModel = require('../models/users');
const leadModel = require('../models/lead');
const { createToken } = require('../helpers/jwt')
const bcryptjs=require('bcryptjs');
const passwordModel = require('../models/forgetPassword')
const mailer = require('../helpers/nodemailer')

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

        const token=createToken(userCreated._id,userCreated.role);
        
        res.status(200).json({ token,message:'signup sucess'});

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
        const userFound = await usersModel.findOne({
            email: input.email
        })
        if (!userFound) {
            throw ({ message: 'User not found!' })
        }
          const compare = await bcryptjs.compare(input.password, userFound.password);
         if (!compare) {
            throw ({ message: 'Password not matched!' })
        }

        const tokenData={email:userFound.email, role:userFound.role}
        const token = createToken(tokenData);
         res.status(200).json({
            message: "Login Successful",
            token
        })
    } catch (error) {
       
        if (error.message){
            res.status(500).json(error);
            return;
        } 
    }
}
async function forgotPassword(req, res) {

    try {
        const input = req.body;
        const user = await usersModel.findOne({ email : input.email},
        {
            'password' : 1,
        });
    
        if (!user){
            throw {message: "User doesn't exist in db."}
        }
        const hasRequested = await passwordModel.findOne({
            UserId : user._id
        })
        if (hasRequested){
            throw({message : "You have already requested for Password Change. Kindly check your mail."})
        }
        requester = await passwordModel.create({
            UserId : user._id,
        })
        const tokenData = {
            email : user.email,
            password : user.password
        }
        const passwordToken =  createToken(tokenData);

        const mailData = {
            email : user.email,
            subject : "Change Your Password",
            
        }
        const mailSent = sendMail
        res.json(passwordToken);
    
    } catch (error) {
        
    }
   



 

}



async function updatePassword(req,res){
    //  DOCUMENT CHECK IN FORGETSCHEMA IF NOT EXIST THORW ERROR 
    // TOKEN DOCUMENT => PURANA PASSWORD == NEW PASSWORD
}
module.exports = {
    signup,
    login,
    forgotPassword
}