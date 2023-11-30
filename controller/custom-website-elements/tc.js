const tc = require('../../models/custom-website-elements/tc')
const logger = require('./../../logger');

let body = {
    data: [
        {
            heading: 'Use of our website :',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'When you use this website and place orders through it, you agree to:' }],
                },
                {
                    content_type: 'list',
                    content_description: [
                        { content: 'Use this website to make enquiries and legally valid orders only.' },
                        { content: 'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.' },
                        { content: 'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.' }]
                },
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'If you do not provide us with all the information we need, you cannot place your order.' }]
                }
            ],
        },
        {
            heading: 'Contract',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'After you place an order you will receive Confirmation mail/Message (Order Confirmation) and (Shipping Confirmation)' }],
                }
            ],
        },
        {
            heading: 'Availability of products',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'All orders are Subject to availability of Products Along this line, if there are difficulties regarding the supply of products or there are no more items left in stock, we reserve the right to provide you with information on substitute products of the same. If you do not wish to order the substitute products, we will reimburse any amount that you may have paid.' }],
                }
            ],
        },
        {
            heading: 'Refusal to process an order',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'We will always do everything possible to process all orders, there may be exceptional circumstances that force us to refuse to process an order after having sent the Order Confirmation. We reserve the right to do so at any time. We reserve the right to remove any product from this website at any time and to remove or modify any material or content from the same.' }],
                },
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'We shall not be liable to you or any third party for removing any product or modifying any product or material or content from our website or not processing an order once we have sent the Order Confirmation.' }],
                }
            ],
        },
        {
            heading: 'Delivery',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'In Continuation to claus (3) above regarding the availability of product and extra ordinary circumstances, we will try to make sure to send the order consisting of Product(s) by date indicated in the Delivery confirmation or if no delivery date is specified, in the estimated time frame within a maximum period of 30 days from the date of Order confirmation.' }],
                },
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'Nonetheless, there may be delays for reasons such as the occurrence of unforeseen circumstances or the delivery zone.' }],
                },
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'For the purpose of these Conditions, the “delivery” shall be understood to have taken place or the order “delivered” as soon as you or a third party indicated by you acquires physical possession of the goods, which will be evidenced by the signing of the receipt of the order at the delivery address indicated by you.' }],
                }
            ],
        },
        {
            heading: 'Price & Payment',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'We make every effort to ensure that the prices featured on the website are correct, error may occur. If we discover an error in the price of any of the products that you have ordered, we will inform you as soon as possible and give you the option of confirming your order at the correct price or cancelling it. If we are unable to contact you, the order will be considered cancelled and all amounts paid will be refunded to you in full.' }],
                }
            ],
        },
        {
            heading: 'Invoice',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'Invoice will be provided to you along with the products when delivered.' }],
                }
            ],
        },
        {
            heading: 'Taxes',
            contentInfo: [
                {
                    content_type: 'paragraph',
                    content_description: [{ content: 'Pursuant to the prevailing rules and regulations in force, all purchases done through the website are subject to all applicable taxes but not limited to GST, duties, cesses, etc.' }],
                }
            ],
        },
        {
            heading: 'Exchange/Return/Refund Policy',
            contentInfo: [
                {
                    content_type: 'list',
                    content_description: [
                        { content: 'We grant you a period of 15 days from the day the order was delivered by the delivery executive.' },
                        { content: 'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.' },
                        { content: 'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.' }]
                }
            ]
        },
        {
            heading: 'Return/Exhange',
            contentInfo: [
                {
                    content_type: 'list',
                    content_description: [
                        { content: 'Customer can exchange the order within 15 days from the date of delivery.' },
                        { content: 'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.' },
                        { content: 'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.' }]
                }
            ]
        },
        {
            heading: 'Return',
            contentInfo: [
                {
                    content_type: 'Refund',
                    content_description: [
                        { content: 'The refund will be initiated in your trade vogue wallet by 7 working days from the date of your order is returned subject to passing the quality check.' },
                        { content: 'Not to make any false or fraudulent orders. If an order of this type may reasonably be considered to have been placed, we shall be authorised to cancel it and inform the competent authorities.' },
                        { content: 'Provide us with your email address, postal address and/or other contact details truthfully and exactly. You also agree that we may use this information to contact you in the context of your order if necessary.' }]
                }
            ]
        },





    ]
}
async function setDocument(req, res) {
    try {
        console.log(req.body);
        await tc.updateOne({}, { $set: { data: req.body.tcFormArray } }, { upsert: true })
        return res.status(200).json({
            message: "Document updated successfully!"
        })
    }
    catch (error){
        console.log(error);
        logger.error(error);
        res.status(500).json(error);
    }
}
async function getDocument(req, res) {
    try {
        let Data = await tc.findOne({});
        res.status(200).json(Data);
    }
    catch (error){
        logger.error(error);
        res.status(500).json({
            message: 'Unable to get tc data.'
        });
    }
}
module.exports = {
    setDocument,
    getDocument
}