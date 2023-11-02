const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');

async function getPaymentKeys(req, res) {
    try {
        const paymentKeys = await PaymentKeys.aggregate([
          {
            $unwind: "$keys" 
          },
          {
            $match: {
              "keys.enable": true 
            }
          },
          {
            $lookup: {
              from: "users", 
              localField: "keys.adminId",
              foreignField: "_id",
              as: "keys.admin" 
            }
          },
          {
            $group: {
              _id: "$_id",
              keys: { $push: "$keys" } 
            }
          }
        ]);
    
        res.status(200).json(paymentKeys);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json(error);
      }
}

async function getAllPaymentKeys(req, res) {
        try {
          const paymentKeys = await PaymentKeys.find({}).populate('keys.adminId');
          res.status(200).json(paymentKeys);
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json(error);
        }
      }
  
  async function addPaymentKeys(req, res) {
    try {
      const { publicKey, privateKey } = req.body;
      const decodedPayload = atob(req.body.adminId);
      const admin = JSON.parse(decodedPayload);
      const adminId = admin.id;
      console.log(adminId, "admin Id Is");
  
      let adminKeys = await PaymentKeys.findOne({});
      
      if (!adminKeys) {
        adminKeys = new PaymentKeys({
          keys: [{ adminId, publicKey, privateKey }]
        });
      } else {
        adminKeys.keys.push({ adminId, publicKey, privateKey });
      }
      
      await adminKeys.save();
      res.status(200).json({ message: 'Payment Keys added Successfully' });
    } catch (error) {
      console.log('error is ', error);
      res.status(500).json(error);
    }
  }
  
  async function updatePaymentKeys(req , res) {
    try {
      const { publicKey, privateKey, id , enable} = req.body;
      const adminId = id;
      console.log(adminId, privateKey, publicKey , id , enable, "admin Id Is");
  
      const adminKeys = await PaymentKeys.findOneAndUpdate(
        { 'keys._id': adminId }, 
        { $set: { 'keys.$.publicKey': publicKey, 'keys.$.privateKey': privateKey, 'keys.$.enable': enable } }, // Update the fields
        { new: true }
      )
        .then(updatedKeys => {
          console.log(updatedKeys);
        })
        .catch(err => {
          console.error(err);
        });
      if (adminKeys) {
        console.log('Document Updated:', adminKeys);
      } else {
        console.log('No matching document found for the given query.');
      }
      res.status(200).json({ message: 'Payment Keys updated Successfully' });
    } catch (error) {
      console.log('error is ', error);
      res.status(500).json(error);
    }
  }
  
  async function deletePaymentKeys(req , res) {
    const { id } = req.body;
    console.log(id);
    const data = await PaymentKeys.deleteOne({ 'keys._id': id });
    console.log(data);
    res.status(200).json({ message: 'Payment Keys deleted Successfully'});
  }
  

module.exports = {
    deletePaymentKeys,
    updatePaymentKeys,
    addPaymentKeys,
    getPaymentKeys,
    getAllPaymentKeys
}