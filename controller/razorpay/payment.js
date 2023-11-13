const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const createUpiPayment = async (req, res) => {
    console.log(req.body.items.name[0]);
    try {
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

            console.log('Razorpay Order:', order); 
            console.log(payloadData, "payload");
            res.status(200).send({
            success: true,
            msg: 'Order Created',
            order_id: order.id,
            amount: amount,
            key_id: RAZORPAY_ID_KEY,
            product_name: req.body.items.name[0],
            description: req.body.items.name[0],
            email: payloadData.email,
          });
        } else {
          console.error('Razorpay Order Creation Error:', err); 
          res.status(400).send({ success: false, msg: 'Something went wrong!' });
        }
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ success: false, msg: 'Internal Server Error' });
    }
  };
  
  


module.exports = {
    createUpiPayment
}