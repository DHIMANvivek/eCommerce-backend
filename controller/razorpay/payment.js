const Razorpay = require('razorpay');
const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');
const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const ordersModel = require('../../models/order');


app.use(cors())
app.use(bodyParser.json())

const createUpiPayment = async (req, res) => {
    console.log(req.body, req.tokenData.id, "coming email is ");
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

                const amount = req.body.amount;

                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: 'googlydhiman.4236@gmail.com',
                };

                razorpayInstance.orders.create(options, (err, order) => {
                    if (!err) {
                        console.log(order, "order is ");
                        res.status(200).send({
                            success: true,
                            msg: 'Order Created',
                            order_id: order.id,
                            amount: amount,
                            key_id: razorpayInstance.key_id,
                            product_name: req.body.items[0].name,
                            description: req.body.order_id,
                            notes: [
                                req.body.order_id
                            ],
                            email: 'googlydhiman.4236@gmail.com',
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
        console.log(error, "error is ");
            res.status(500).send({ success: false, msg: 'Internal Server Error' });
        }
    }

    const verify = async (req, res) => {
        const secret = 'tradevogue';

        console.log(req.body.payload, "body is from verify"); 
    
        const shasum = crypto.createHmac('sha256', secret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')
    
        console.log(digest, req.headers['x-razorpay-signature'])

        if (digest === req.headers['x-razorpay-signature']) {
            console.log('request is legit');
    
            //existing code to read/write data to JSON file
            let paymentData = [];
            try {
                const fs = require('fs')
                if (fs.existsSync('razorPayLogs.json')) { 
                    const existingData = fs.readFileSync('razorPayLogs.json', 'utf8');
                    paymentData = JSON.parse(existingData); 
                }


                const result = await ordersModel.updateOne(
                    { orderID: req.body.payload.payment.entity.description },
                    {
                      $set: {
                        payment_status: 'success',
                        transactionId: req.body.payload.payment.entity.id,
                        MOP: req.body.payload.payment.entity.method,
                      },
                    }
                  );

            } catch (err) {
                console.error(err);
            }
    
            paymentData.push(req.body); 
    
            try {
                fs.writeFileSync('razorPayLogs.json', JSON.stringify(paymentData, null, 4)); 
                console.log('Data appended to razorPayLogs.json');
            } catch (err) {
                console.error(err);
            }
        } else {
            console.log("not saved");
        }
        res.json({ status: 'ok' });
    };
    
    
    module.exports = {
        createUpiPayment,
        verify
    }