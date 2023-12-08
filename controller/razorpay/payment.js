const Razorpay = require('razorpay');
const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');
const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const ordersModel = require('../../models/order');
const Products = require('../../models/products')
const {getrazorPaymentKeyPromise}=require('../custom-website-elements/paymentKeys');
const {decryptPaymentKeys}=require('../custom-website-elements/paymentKeys');   
const { sendInvoiceTemplate } = require('../../helpers/INDEX');
const mailer = require('../../helpers/nodemailer');
const userModel = require('../../models/users');

app.use(cors())
app.use(bodyParser.json())

const createUpiPayment = async (req, res) => {

    console.log(req.body, "req.body is ----------------------------------------");

    const response=await getrazorPaymentKeyPromise(req,res);

    const keysResponse = await decryptPaymentKeys(response[0]);
    try {

        if (keysResponse && keysResponse[0].decryptedPublicKey && keysResponse[0].decryptedPrivateKey) {
            // Find the enabled Razorpay key

            console.log(keysResponse[0].decryptedPublicKey, keysResponse[0].decryptedPrivateKey, "coming email is ");
            
                const razorpayInstance = new Razorpay({
                    key_id: keysResponse[0].decryptedPublicKey,
                    key_secret: keysResponse[0].decryptedPrivateKey
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
                        
                        console.log(req.body.items, "----------------------------------------------------");
                        res.status(200).send({
                            success: true,
                            msg: 'Order Created',
                            order_id: order.id,
                            amount: amount,
                            key_id: razorpayInstance.key_id,
                            product_name: req.body.items,
                            description: req.body.order_id,
                            notes: [
                                req.body.items
                            ],
                            email: 'googlydhiman.4236@gmail.com',
                        });
                    } else {
                        res.status(400).send({ success: false, msg: 'Something went wrong!' });
                    }
                });
        }
     } catch (error) {
        console.log(error, "error is ");
            res.status(500).send({ success: false, msg: 'Internal Server Error' });
        }
    }

    const verify = async (req, res) => {
        const secret = 'tradevogue';
        const shasum = crypto.createHmac('sha256', secret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')
    
        console.log(digest, req.headers['x-razorpay-signature'])

        if (digest === req.headers['x-razorpay-signature']) {
            console.log('request is legit');

            const orderId = req.body.payload.payment.entity.description;
            let paymentData = [];

        try {
             const fs = require('fs')
                if (fs.existsSync('razorPayLogs.json')) { 
                    const existingData = fs.readFileSync('razorPayLogs.json', 'utf8');
                    paymentData = JSON.parse(existingData); 
                }

          const result = await ordersModel.findOneAndUpdate(
            { orderID: orderId },
            {
              $set: {
                'products.$[].payment_status': 'success',
                transactionId: req.body.payload.payment.entity.id,
                MOP: req.body.payload.payment.entity.method,
              },
            },
            { projection: { buyerId: 1 ,products:1,coupon:1}, returnOriginal: false }
          );
          var buyerId = result.buyerId.toString();
          const user = await userModel.findOne({ _id: buyerId }, { _id: 0, email: 1, name: 1 });

          if(result?.couponId){
            await updateCoupon(result.couponId,buyerId); 
        }
   
        if (result?.products) {
            await Promise.all(result.products.map(async (el) => {
              console.log('goint to decrease  product');
                await Products.updateOne(
                    {
                        sku: el.sku,
                        'assets.color': el.color,
                        'assets.stockQuantity.size': el.size
                    },
                    {
                        $inc: { 'assets.$[outer].stockQuantity.$[inner].quantity': -el.quantity, 'assets.$[outer].stockQuantity.$[inner].unitSold': el.quantity },
                    },
                    {
                        arrayFilters: [
                            { "outer.color": el.color },
                            { "inner.size": el.size }
                        ]
                    }
                );

                let particularProduct = await Products.findOne({ sku: el.sku });
                const allStockZero = particularProduct.assets.every(color => {
                    return color.stockQuantity.every(size => size.quantity === 0);
                });

                if (allStockZero) {
                    await Products.updateOne({sku:el.sku},{ $set:{"status.active": false} });
                }

            }));
        }
          
        //   const mailData = {
        //     email: user.email,
        //     subject: "Invoice",
        //     invoice: result.products[0]
        //   }

        //   const emailTemplate = sendInvoiceTemplate(mailData.invoice);
        //   await mailer(mailData, emailTemplate);

          // product decrease query



        } catch (err) {
          console.error('Error updating order:', err);
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