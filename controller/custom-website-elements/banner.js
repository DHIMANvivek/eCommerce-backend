const banners = require('../../models/custom-website-elements/customBanner')

async function setBanners(req, res) {
    try {

        // console.log("mai idhar aya?");
        const input = req.body;
        // console.log(input);
        // console.log(input.banner, "input.banner hai yeh");
        const insertBanners = await banners.insertMany(input.banner);
        // console.log("haye finally", insertBanners);
        res.status(200).json({
            message: "hogya bhai"
        })
    }
    catch (error) {
        console.log(error, "banner");
    }
}
async function getBanners(req, res) {
    try {
        let bannersData = await banners.find();
        // console.log(bannersData);
        res.status(200).json(bannersData);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Unable to get Socials data.'
        });
    }
}

module.exports = {
    setBanners,
    getBanners
}