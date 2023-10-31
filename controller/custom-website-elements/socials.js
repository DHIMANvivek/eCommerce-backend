const Socials = require('./../../models/custom-website-elements/socials');

async function setSocials(req, res) {
    try {
        input = req.body;

        const socialsData = {
            email: input.email,
            mobile: input.mobile,
            address: input.address,
            facebook: input.facebook,
            whatsapp: input.whatsapp,
            instagram: {
                link: input.instagramLink,
                accountID: input.accountID,
                accessToken: input.accessToken,
            },
        };

        const existingSocials = await Socials.findOne();

        if (existingSocials) {
            await Socials.findByIdAndUpdate(existingSocials._id, socialsData);
        }
        else {
            await Socials.create(socialsData);
        }

        res.status(200).json({
            message: 'Successfully updated Social Details'
        })
    } catch (error) {
        console.log(error);
        res.status(409).json({
            message: 'Cannot Set Social links right now.'
        });
    }
}

async function getSocials(req, res){
    try {
        let socialsData = await Socials.findOne({});
        res.status(200).json(socialsData);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Unable to get Socials data.'
        });
    }
}

module.exports = {
    setSocials,
    getSocials
}