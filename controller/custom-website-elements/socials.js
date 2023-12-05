const Socials = require('./../../models/custom-website-elements/socials');
const logger = require('./../../logger');
const axios = require('axios');
const redisClient = require('./../../config/redisClient');

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
            logos: {
                desktop: input.desktopLogo,
                mobile: input.mobileLogo
            }
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
        logger.error(error);
        res.status(409).json({
            message: 'Cannot Set Social links right now.'
        });
    }
}

async function getSocials(req, res) {
    try {
        let socialsData = await Socials.findOne({});
        res.status(200).json(socialsData);

    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Unable to get Socials data.'
        });
    }
}

async function getInstagramMedia(req, res) {
    try {
        let { accountID, accessToken } = (await Socials.findOne({})).instagram;

        let finalOutput = {
            username: '',
            posts: []
        }

        const metaMedia = (await axios.get('https://graph.instagram.com/' + accountID + '?fields=username,media&access_token=' + accessToken)).data;
        finalOutput.username = metaMedia.username;

        let i = 0;
        for (let postID of metaMedia.media.data) {

            const postData = (await axios.get('https://graph.instagram.com/' + postID.id + '?fields=media_type,media_url,permalink&access_token=' + accessToken)).data;

            if (i > 8) {
                return;
            }

            if (postData.media_type === 'IMAGE' || postData.media_type === 'CAROUSEL_ALBUM') {
                i += 1;
                finalOutput.posts.push({
                    postLink: postData.permalink,
                    imageLink: postData.media_url
                });
            }

        }

        redisClient.setEx(`socials/getInstagram`, 24*60*60, JSON.stringify(finalOutput));
        res.status(200).json(finalOutput);

    } catch (error) { 
        logger.error(error, "Meta Did'nt Responded");
        res.status(500).json({
            message: "Meta Did'nt Responded"
        });
    }
}

module.exports = {
    setSocials,
    getSocials,
    getInstagramMedia
}