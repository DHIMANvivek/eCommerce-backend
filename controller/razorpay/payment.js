const Razorpay = require('razorpay');
const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');

const createUpiPayment = async (req, res) => {
    try {
        const keys = await PaymentKeys.findOne({});

        if (keys && keys.razorKey && keys.razorKey.length > 0) {
            // Find the enabled Razorpay key
            const enabledRazorKey = keys.razorKey.find(key => key.enable === true);

            if (enabledRazorKey) {
                const razorpayInstance = new Razorpay({
                    key_id: enabledRazorKey.rzpIdKey,
                    key_secret: enabledRazorKey.rzpSecretKey
                });

                const amount = req.body.items.price * 100;

                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: 'googlydhiman.4236@gmail.com',
                };

                razorpayInstance.orders.create(options, (err, order) => {
                    if (!err) {
                        const token = req.body.token;
                        const [header, payload, signature] = token.split('.');
                        const decodedPayload = atob(payload);
                        const payloadData = JSON.parse(decodedPayload);

                        res.status(200).send({
                            success: true,
                            msg: 'Order Created',
                            order_id: order.id,
                            amount: amount,
                            key_id: razorpayInstance.key_id,
                            product_name: req.body.items.name[0],
                            description: req.body.items.name[0],
                            email: payloadData.email,
                        });
                    } else {
                        res.status(400).send({ success: false, msg: 'Something went wrong!' });
                    }
                });
            } else {
                res.status(400).send({ success: false, msg: 'No enabled Razorpay key found' });
            }
        }
     } catch (error) {
            res.status(500).send({ success: false, msg: 'Internal Server Error' });
        }
    }





    module.exports = {
        createUpiPayment
    }