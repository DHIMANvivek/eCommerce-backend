const dealsModel = require('../../models/custom-website-elements/deals');

async function updateDealsPage(req,res){
try {   
    console.log('req.body coming is ',req.body);
        const updateDealsPage=await dealsModel.updateOne({},{$set:req.body},{ upsert : true });
        const Details=await dealsModel.findOne({});
        res.status(200).json(Details);
} catch (error) {
    console.log('error coming is -----> ',error);
    res.status(500).json(error);
}
}


async function getDealsPageDetails(req,res){
    try {
        const Details=await dealsModel.findOne({});
        res.status(200).json(Details);
} catch (error) {
    res.status(500).json(error);
}
}

module.exports={
    updateDealsPage,
    getDealsPageDetails
}