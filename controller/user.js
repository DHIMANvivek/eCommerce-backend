const usersModel = require('../models/users');
const users = require('../models/users');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getDetails(req, res) {
    try {
        req.body._id = '6513a7af4e2d06d1e0e44660';
        const basicDetails = await usersModel.findById(req.body._id);
        console.log("baic details ",basicDetails);
        res.status(200).json(basicDetails)
    } catch (error) {
        res.status(500).json(error);
    }
}

async function updateDetails(req, res) {
    try {
        req.body._id = '6513a7af4e2d06d1e0e44660';
        const basicDetails = await usersModel.findByIdAndUpdate(req.body._id, req.body, { new: true });
       
        res.status(200).json(basicDetails)
    } catch (error) {
        res.status(500).json(error);
    }
}

async function getAddress(req, res) {
    try {
        req.body._id = '6513a7af4e2d06d1e0e44660';
        const Addresses = await usersModel.findById(req.body._id, 'info.address');
        res.status(200).json(Addresses)
    }
    catch (error) {
        res.status(500).json(error);
    }
}

async function addAddress(req, res) {
    try {
        const addressAdded = await usersModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId('651fdc60a055f39416501e50') },
            { $push: { 'info.address': req.body } },
            { new: true }

        )

        if (!addressAdded) throw ({ message: 'Address not updated' })
        res.status(200).json(addressAdded);
    } catch (error) {
        res.status(500).json(error)
    }
}

async function deleteAddress(req, res) {
    try {
        const deletedAddress = await usersModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660') },
            { $pull: { 'info.address': { _id: '652390e5f04fae193297dffb' } } },
            { new: true }


        )


        res.status(200).json(deleteAddress);
    } catch (error) {
        res.status(500).json(error);
    }
}

async function updateAddress(req, res) {
    try {
        const updateParticularAddress = await usersModel.updateOne({ _id: new mongoose.Types.ObjectId("6513a7af4e2d06d1e0e44660") }, { $set: { email: 'Abhishekl23@gmail.com' } })
        res.status(200).json(updateParticularAddress)
    } catch (error) {
        res.status(500).json(error)
    }
}

async function createPaymentIntent(req, res) {
    try {
        const { items } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseFloat(items[0].price * 100),
            currency: "inr",
            description: JSON.stringify(items),
            metadata: {
                items: JSON.stringify(items),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
}

async function getOrders(req, res) {
    try {
        const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        res.status(200).json(userOrders);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}

async function getAdminDetails(req, res) {
    try {
        const response = await users.find({ role: 'admin' });
        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    }catch(err){
        console.log(err);
        return res.status(404).send();
    }
}

module.exports = {
    getDetails,
    updateDetails,
    getAddress,
    addAddress,
    deleteAddress,
    updateAddress,
    createPaymentIntent,
    getOrders,
    getAdminDetails
}