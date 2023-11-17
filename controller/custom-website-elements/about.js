const aboutModel = require('../../models/custom-website-elements/about');

async function updateAboutPage(req,res){
try {   
        const updateDealsPage=await aboutModel.updateOne({},{$set:req.body},{ upsert : true });
        const Details=await aboutModel.findOne({});
        res.status(200).json(Details);
} catch (error) {
    res.status(500).json(error);
}
}


async function getAboutPageDetails(req,res){
    try {
        const Details=await aboutModel.findOne({});
        res.status(200).json(Details);
} catch (error) {
    res.status(500).json(error);
}
}

module.exports={
    updateAboutPage,
    getAboutPageDetails
}