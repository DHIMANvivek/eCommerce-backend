const banners = require('../../models/custom-website-elements/customBanner')

async function setBanners(req, res) {
    try {
        const input = req.body;
        const insertBanners = await banners.create(input);
        res.status(200).json({
            message: "Banner created successfully!"
        })
    }
    catch (error) {
        console.log(error, "banner");
    }
}
async function getBanners(req, res) {
    try {
        let bannersData = await banners.find(
            // {
            //     'active': true
            // }
        );
        console.log(bannersData);
        res.status(200).json(bannersData);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Unable to get banners.'
        });
    }
}
async function deleteBanner(req, res) {
    try {
        const input = req.body;
        console.log(input);

        await banners.findByIdAndDelete(input.id)
        res.status(200).json({
            message: "Banner deleted!"
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Unable to delete banner.'
        });
    }
}
async function updateBanner(req, res) {
    try {
        const input = req.body;
        console.log(input, "update input");

        await banners.findByIdAndUpdate({
            _id: input.id,
        },
            { $set: input.data }
        )
        res.status(200).json({
            message: "Banner updated successfully!"
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in updating banner!"
        })
    }
}
async function toggleBanner(req, res) {
    try {
        const input = req.body;
        console.log(input, "toggle input");
        await banners.findByIdAndUpdate({
            _id: input.id,

        },
            {
                $set: {
                    'active': input.active
                }
            })
        return res.status(200).json({
            message: "Updated successfully!"
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in updating banner!"
        })
    }
}

module.exports = {
    setBanners,
    getBanners,
    deleteBanner,
    updateBanner,
    toggleBanner
}