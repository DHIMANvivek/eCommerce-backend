const tc = require('../../models/custom-website-elements/tc')

let body = {data:[
    {
    heading: 'Use of our website',
        contentInfo: [
            { content_type: 'paragraph',
                content_description: 'When you use this website and place orders through it, you agree to:',
            },
            {
                content_type:  'list',
                content_description: ['Use this website to make enquiries and legally valid orders only.',
                 'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.', 
                 'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.']
            },
            {
                content_type: 'paragraph',
                content_description: 'If you do not provide us with all the information we need, you cannot place your order.'
            }
        ],
    },
    {
        heading: 'Use of our website 2',
            contentInfo: [
                { content_type: 'paragraph',
                    content_description: 'When you use this website and place orders through it, you agree to:',
                },
                {
                    content_type:  'list',
                    content_description: ['Use this website to make enquiries and legally valid orders only.',
                     'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.', 
                     'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.']
                },
                {
                    content_type: 'paragraph',
                    content_description: 'If you do not provide us with all the information we need, you cannot place your order.'
                }
            ],
        }
  

]}
async function setDocument (req, res){
    try {
        console.log(req.body, "input");
        req.body.data=req.body.TandC;
        // const tcDocument = await tc.findOne();
        // console.log(tcDocument, "tc doc");

            await tc.updateOne({}, {$set:body},{upsert:true})


        return res.status(200).json({
            message: "created successfully!"
        })
    }
    catch (error){
        console.log('error', error);
        res.status(500).json(error);
    }
}
async function getDocument(req, res){
    try {
        let Data = await tc.findOne({});
        console.log(Data, "tc data");
        res.status(200).json(Data);
    }
    catch (error){
        res.status(500).json({
            message: 'Unable to get tc data.'
        });
    }
}
module.exports = {
    setDocument,
    getDocument
}