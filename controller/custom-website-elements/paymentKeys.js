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
    const paymentKeys = await PaymentKeys.find({})
      .populate('keys.adminId')
      .populate('razorKey.adminId');

    res.status(200).json(paymentKeys);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json(error);
  }
}

  
      async function addPaymentKeys(req, res) {
        try {
          const { publicKey, privateKey, rzpPublicKey, rzpPrivateKey } = req.body;
          const decodedPayload = atob(req.body.adminId);
          const admin = JSON.parse(decodedPayload);
          const adminId = admin.id;
      
          let adminKeys = await PaymentKeys.findOne({});
      
          if (!adminKeys) {
            adminKeys = new PaymentKeys({
              keys: [],
              razorKey: []
            });
          }
      
          if (publicKey && privateKey) {
            adminKeys.keys.push({ adminId, publicKey, privateKey });
          }
      
          if (rzpPublicKey && rzpPrivateKey) {
            adminKeys.razorKey.push({ adminId, rzpIdKey: rzpPublicKey, rzpSecretKey: rzpPrivateKey });
          }
      
          await adminKeys.save();
          res.status(200).json({ message: 'Payment Keys added Successfully' });
        } catch (error) {
          res.status(500).json(error);
        }
      }
      
  
      async function updatePaymentKeys(req, res) {
        try {
          const { publicKey, privateKey, id, enable } = req.body;
          const adminId = id;
          console.log(adminId, privateKey, publicKey, id, enable, "admin Id Is");
      
          await PaymentKeys.updateMany({}, { $set: { 'keys.$[elem].enable': false } }, { arrayFilters: [{ 'elem.enable': true }] });
      
          if (enable === true) {
            const adminKeys = await PaymentKeys.findOneAndUpdate(
              { 'keys._id': adminId },
              { $set: { 'keys.$.publicKey': publicKey, 'keys.$.privateKey': privateKey, 'keys.$.enable': true } },
              { new: true }
            );
      
            if (adminKeys) {
              console.log('Document Updated:', adminKeys);
              res.status(200).json({ message: 'Payment Keys updated Successfully' });
            } else {
              console.log('No matching document found for the given query.');
              res.status(404).json({ message: 'No matching document found for the given query.' });
            }
          } else {
            console.log('Received enable is not true.');
            res.status(200).json({ message: 'Received enable is not true.' });
          }
        } catch (error) {
          console.log('Error:', error);
          res.status(500).json(error);
        }
      }
  
      async function deletePaymentKeys(req, res) {
        const { id } = req.body;
        console.log(id);
        
        try {
          const data = await PaymentKeys.findOneAndDelete({ 'keys._id': id });
          console.log(data);
      
          if (data) {
            res.status(200).json({ message: 'Payment Key deleted Successfully' });
          } else {
            console.log('No matching document found for the given query.');
            res.status(404).json({ message: 'No matching document found for the given query.' });
          }
        } catch (error) {
          console.log('Error:', error);
          res.status(500).json(error);
        }
      }
      
  

module.exports = {
    deletePaymentKeys,
    updatePaymentKeys,
    addPaymentKeys,
    getPaymentKeys,
    getAllPaymentKeys
}