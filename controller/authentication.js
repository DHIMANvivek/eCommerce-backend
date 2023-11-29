const usersModel = require('../models/users');
const leadModel = require('../models/lead');
const { createToken } = require('../helpers/jwt')
const bcryptjs = require('bcryptjs');
const passwordModel = require('../models/forgetPassword')
const mailer = require('../helpers/nodemailer')
const { OAuth2Client } = require('google-auth-library');
const { SignupTemplate, ForgetTemplate, SubscribeTemplate } = require('../helpers/INDEX');
const logger = require('./../logger');

async function login(req, res) {
    try {
        const input = req.body;
        if (input.token) {
            const googleOathClient = new OAuth2Client();
            const googleToken = await googleOathClient.verifyIdToken({
                idToken: req.body.token.credential
            });
            input.email = googleToken.getPayload().email;
            input.provider = 'GOOGLE';
            req.body.name = {
                firstname: googleToken.getPayload().given_name,
                lastname: googleToken.getPayload().family_name
            }
        }

        const userFound = await usersModel.findOne({
            email: input.email
        })
        const firstName = userFound?.name.firstname

        // PURE GOOGLE LOGIN
        if (input.token) {
            if(!userFound){
                const userCreated = usersModel(req.body);
                await userCreated.save();      
            }
            const tokenData = { email: userFound.email, id: userFound._id, role: userFound.role }
            const token = createToken(tokenData);
            res.status(200).json({ token, firstName });
            return;
        }
        
        if (!userFound) {
            throw ({ message: 'Kindly Signup!' })
        }
        // GOOGLE USER TRYING TO LOGIN MANUALLY.
        if (userFound.provider == 'GOOGLE') {
            throw ({ message: 'Try login with Google, you already have account registered with it.' });
        }

        // NORMAL USER USER TRYING TO LOGIN WITH GOOGLE.
        if (userFound.provider == 'direct' && input.token) {
            throw ({ message: 'Try to login manually.' });
        }

        // PURE MANUAL LOGIN
        const compare = await bcryptjs.compare(input.password, userFound.password);
        if (!compare) {
            throw ({ message: 'Incorrect Password!' })
        }

        const tokenData = { id: userFound._id, role: userFound.role }

        const token = createToken(tokenData);
        res.status(200).json({
            token, firstName
        })
    } catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

async function signup(req, res) {
    try {
        if (req.body.token) {
            const googleOathClient = new OAuth2Client();
            const ticket = await googleOathClient.verifyIdToken({
                idToken: req.body.token.credential
            });

            req.body.email = ticket.getPayload().email;
            req.body.provider = 'GOOGLE';
            req.body.name = {
                firstname: ticket.getPayload().given_name,
                lastname: ticket.getPayload().family_name
            }
        }
        const firstName = req.body.name.firstname;
        
        const user = await usersModel.findOne({ email: req.body.email });

        //google signup/login
        if (req.body.token) {
            if(!user){
                const userCreated = usersModel(req.body);
                await userCreated.save();      
            }
            const tokenData = { email: user.email, id: user._id, role: user.role }
            const token = createToken(tokenData);
            res.status(200).json({ token, firstName });
            return;
        }
      
        if (user) {
            throw ({ message: 'User already exists! Try to login.' });
        }

        const leadFound = await leadModel.findOne({ email: req.body.email });
        const userCreated = usersModel(req.body);

        if (leadFound) {
            userCreated.Lead = leadFound;
        }
        await userCreated.save();
        const mailData = {
            email: req.body.email,
            subject: "We're Thrilled to Have You, Welcome to Trade Vogue!",
        }
        const mailSent = await mailer(mailData, SignupTemplate())
        const tokenData = {
            id: userCreated._id,
            role: userCreated.role
        }
        const token = createToken(tokenData);
        res.status(200).json({ token, firstName });

    } catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }

}

async function forgotPassword(req, res) {
    try {
        const input = req.body;
        const user = await usersModel.findOne({ email: input.email },
            {
                'email': 1,
                'password': 1,
                'provider': 1,
            });

       
        if (!user) {
            throw { message: "This email doesn't exist." }
        }
        if (user.provider == 'GOOGLE') {
            throw ({ message: 'Google user cannot change password' });
        }
        const hasRequested = await passwordModel.findOne({
            UserId: user._id
        })
        if (hasRequested) {
            throw ({ message: "You have already requested for Password Change. Kindly check your mail." })
        }
        requester = await passwordModel.create({
            UserId: user._id,
        })
        const tokenData = {
            id: user._id
        }
        const passwordToken = createToken(tokenData);

        const mailData = {
            email: user.email,
            subject: "Password Reset",
        }
        const mailSent = await mailer(mailData, ForgetTemplate(passwordToken))
        res.status(200).json({ passwordToken, message: "Mail Sent Successfully" });

    } catch (error) {
        logger.error(error);
        if (error.message) {
            res.status(500).json(error);
            return;
        }
        res.status(500).json(error);
    }
}

async function updatePassword(req, res) {
    try {
        const input = req.body;
        const tokenData = req.tokenData;

        const requesterFound = await passwordModel.findOne({
            UserId: tokenData.id
        })

        if (!requesterFound) {
            throw ({ message: "Please request for reset password." })
        }
        let currentTime = new Date().getTime();
        let requesterTime = requesterFound.createdAt.getTime();

        const checkTime = (currentTime - requesterTime) / 60000;


        if (checkTime < 5) {

            const user = await usersModel.findById(tokenData.id)

            const compare = await bcryptjs.compare(input.password, user.password)
            if (compare) {
                throw ({
                    message: 'Cannot set same password as before!'
                })
            }
            await usersModel.updateOne({
                email: user.email
            }, {
                $set: { 'password': await bcryptjs.hash(input.password, 10) }
            })
            const delUser = await passwordModel.deleteOne({
                UserId: tokenData.id
            })
            return res.status(200).json({ message: 'Password Changed Successfully!' })
        }
        return res.status(400).json({
            message: "Please request for Reset Password again."
        })

    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }

}

async function changePassword(req, res) {
    try {
        const input = req.body;
        const user = await usersModel.findById(req.tokenData.id)

        if (user.provider == 'GOOGLE'){
            throw ({message: "Cannot change password since you are a Google user!"})
        }
      
        const compareOldPassword = await bcryptjs.compare(input.oldPassword, user.password)

        if (compareOldPassword) {
            if (input.oldPassword === input.newPassword){
                throw ({message: "Cannot set same password as before!"})
            }
            const updatePassword = await usersModel.findByIdAndUpdate({
                _id: user.id
            }, {
                password: await bcryptjs.hash(input.newPassword, 10)
            })
            return res.status(200).json({
                message: "Password Reset Successful!"
            })
        }
        else{
            throw({message:'Your Password is incorrect'})
        }
    }
    catch (error) {
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
async function subscribeMail(req, res) {
    try {
        const user = await usersModel.findOne({ email: req.body.email });
        if (user) {
            throw({message:'You are already a user'});
        }
        else {
            const findLead=await leadModel.findOne(req.body);
            if(findLead){
                throw({message:'You are already in our Mailing List :)'})
            }
            const leadCreated = leadModel(req.body);
            await leadCreated.save();
            const mailData = {
            email: req.body.email,
            subject: "Thank You for Subscribing to TradeVogue"

        }
        const mailSent = await mailer(mailData, SubscribeTemplate());
        res.status(200).json({
            message: "You will be notified about latest deal and offers."
        })
        }
  
    }
    catch(error){
        logger.error(error);
        if (error.message) return res.status(500).json(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
module.exports = {
    signup,
    login,
    forgotPassword,
    updatePassword,
    changePassword,
    subscribeMail,
}