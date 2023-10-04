const usersModel=require('../models/users');
const LeadModel=require('../models/lead');
async function Signup(req,res){
    try {
        const user= await usersModel.findOne({email:req.body.email});
        if(user){
            throw ('User already exist');
        }

        const leadFound=await LeadModel.findOne({email:req.body.email});
        
        const userCreated=await usersModel(req.body);

        if(leadFound){
            userCreated.Lead=leadFound;
        }

        await userCreated.save();
        res.status(200).json({success:true});
        
    } catch (error) {
        res.status(500).json(error);
    }
  
}


async function Login(req,res){
    try {
        const userFind=await usersModel.find({_id:req.body._id});
        if(!userFind){
            throw ('User Does not present');
        }

        
        res.status(200).json({sucess:true});

    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports={
    Signup,
    Login
}