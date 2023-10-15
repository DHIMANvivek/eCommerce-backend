const usersModel = require('../models/users');
const leadModel = require('../models/lead');
const { createToken } = require('../helpers/jwt')
const bcryptjs = require('bcryptjs');
const passwordModel = require('../models/forgetPassword')
const mailer = require('../helpers/nodemailer')
const { OAuth2Client } = require('google-auth-library');
async function login(req, res) {
    try {
        console.log('LOGIN CALLEDD--------');
        const input = req.body;
        if (input.token) {
            console.log("login google");
            const googleOathClient = new OAuth2Client();
            const googleToken = await googleOathClient.verifyIdToken({
                idToken: req.body.token.credential
            });
            input.email = googleToken.getPayload().email;
            input.provider = 'GOOGLE';
            req.body.name = {
                firstname : googleToken.getPayload().given_name,
                lastname : googleToken.getPayload().family_name
            }

            // const firstName = req.body.name.firstname; 
        }
        
        const userFound = await usersModel.findOne({
            email: input.email
        })
        const firstName = userFound.name.firstname
       
        if (!userFound) {
            throw ({ message: 'User not found! Kindly sign in.' })
        }


        // PURE GOOGLE LOGIN
        if(userFound.provider=='GOOGLE' && input.token){
            const tokenData = { email: userFound.email, role: userFound.role }
            const token = createToken(tokenData);
            res.status(200).json({message:'login sucece',token, firstName});
            return;
        }

        // GOOGLE USER TRYING TO LOGIN MANUALLY.
        if(userFound.provider=='GOOGLE'){
            throw ({ message: 'Try login with Google, you already have account registered with it.' });
         }

        // NORMAL USER USER TRYING TO LOGIN WITH GOOGLE.
        if(userFound.provider=='direct' && input.token){
            throw ({ message: 'Try to login manually.' });
         }


        // PURE MANUAL LOGIN
        const compare = await bcryptjs.compare(input.password, userFound.password);
        if (!compare) {
            throw ({ message: 'Incorrect Password!' })
        }

        const tokenData = {id: userFound._id, role: userFound.role }
        const token = createToken(tokenData);

        res.status(200).json({
            message: "Login Successful",
            token, firstName
        })
    } catch (error) {
        console.log("ERROR IS ",error);
        if (error.message) {
            res.status(500).json(error);
            return;
        }
    }
}

async function signup(req, res) {
    try {
        console.log('SINGUP CALLEDD--------');
        if (req.body.token) {
            const googleOathClient = new OAuth2Client();
            const ticket = await googleOathClient.verifyIdToken({
                idToken: req.body.token.credential
            });

            req.body.email = ticket.getPayload().email;
            req.body.provider = 'GOOGLE';
            req.body.name = {
                firstname : ticket.getPayload().given_name,
                lastname : ticket.getPayload().family_name
            }
        }
        const firstName = req.body.name.firstname; 

        const user = await usersModel.findOne({ email: req.body.email });
        if (user) {
            throw ({ message: 'User already exists! Try to login.' });
        }

        const leadFound = await leadModel.findOne({ email: req.body.email });
        const userCreated = await usersModel(req.body);
      
        if (leadFound) {
            userCreated.Lead = leadFound;
        }

        await userCreated.save();

        const mailData = {
            email: req.body.email,
            subject: "We're Thrilled to Have You, Welcome to Trade Vogue!",
        }
        const mailSent = await mailer(mailData)

        const tokenData = {
            id: userCreated._id,
            role: userCreated.role
        }
        const token = createToken(tokenData);
        res.status(200).json({ token, message: 'Signup Successful!' , firstName });

    } catch (error) {
        console.log("Error in Signup", error)
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }

}

async function forgotPassword(req, res) {

    try {
        const input = req.body;
        const user = await usersModel.findOne({ email: input.email },
            {
                'email': 1,
                'password': 1,
                'provider':1,
             });

            if(user.provider=='GOOGLE'){
                return res.status(500).json({message:'You cannot change your password as you are google user'});
            }
        
        if (!user) {
            throw { message: "User doesn't exist in db." }
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
        const mailSent = await mailer(mailData, passwordToken)
        res.status(200).json({ passwordToken, message: "Mail Sent Successfully" });

    } catch (error) {
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

        const user = await usersModel.findById(tokenData.id)
        console.log(user, "userrrrr");
        console.log(input.password, "input pass", user.password, "user pass")
        const compare = await bcryptjs.compare(input.password, user.password)
        console.log(" COMPARE ANSWER IS ",compare);
        if (compare) {
            return res.status(400).json({
                message: 'Cannot set same password as before'
            })
        }

        const delUser = await passwordModel.deleteOne({
            UserId: tokenData.id
        })
        // if (tokenData.password === user.password) {
        //     await usersModel.updateOne({
        //         email: user.email
        //     }, {
        //         $set: { 'password': await bcryptjs.hash(input.password, 10) }
        //     })

        //     await passwordModel.deleteOne({
        //         UserId: tokenData.id
        //     })

        //     return res.status(200).json({
        //         message: "Password Changed Successfully!"
        //     })
        // }

        await usersModel.updateOne({
                    email: user.email
                }, {
                    $set: { 'password': await bcryptjs.hash(input.password, 10) }
                })
        res.status(200).json({message:'password changed success'})

    }
    catch (error) {
        console.log("error is ",error)
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }

}

async function changePassword(req, res) {
    try {
        const input = req.body;
        const user = await usersModel.findById(req.tokenData.id)
      
        const compareOldPassword = await bcryptjs.compare(input.oldPassword, user.password)
   
        if (compareOldPassword){
            const updatePassword = await usersModel.findByIdAndUpdate({
                _id : user.id
            },{
                password : await bcryptjs.hash(input.newPassword, 10)
            })
            console.log("updated successfully");
            return res.status(200).json({
                message : "You have changed your password successfully!"
            })
        }
        return res.status(201).json({
            message : "Your old password is incorrect!"
        })
    }
    catch (error) {
        // if (error.message) {
        //     res.status(500).json(error);
        //     return;
        // }
        // res.status(500).json({
        //     message : "Your old password is incorrect!"
        // });
        res.status(500).json({
            message : "Your old password is incorrect."
        })
    }
}

module.exports = {
    signup,
    login,
    forgotPassword,
    updatePassword,
    changePassword
}