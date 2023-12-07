const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');
const redisClient = require('./../../config/redisClient');
const logger = require('./../../logger');



async function getPaymentKeyPromise(req,res){
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

    return new Promise((res,rej)=>{
      res(paymentKeys);
    })
  } catch (error) {
    console.log("error inside getPyment keys ")
    logger.error(error);
    res.status(500).json(error);
  }
}

async function getPaymentKeys(req, res) {
  try {
    // const paymentKeys = await PaymentKeys.aggregate([
    //   {
    //     $unwind: "$keys"
    //   },
    //   {
    //     $match: {
    //       "keys.enable": true
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "keys.adminId",
    //       foreignField: "_id",
    //       as: "keys.admin"
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       keys: { $push: "$keys" }
    //     }
    //   }
    // ]);

    const paymentKeys=await getPaymentKeyPromise(req,res);
    // console.log('payment keys is ',paymentKeys);
    res.status(200).json(paymentKeys);
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    res.status(500).json(error);
  }
}

  
      async function addPaymentKeys(req, res) {
        try {
          const { publicKey, privateKey, rzpPublicKey, rzpPrivateKey } = req.body;
          const adminId =  req.tokenData.id
      
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
            const { publicKey, privateKey, id, enable, rzpIdKey, rzpSecretKey } = req.body;
            const adminId = id;
    
            // Disable all keys
            if (publicKey && privateKey) {
                await PaymentKeys.updateMany({}, { $set: { 'keys.$[].enable': false } });
            } else if (rzpIdKey && rzpSecretKey) {
                await PaymentKeys.updateMany({}, { $set: { 'razorKey.$[].enable': false } });
            }
    
            if (enable === true && publicKey && privateKey) {
                const adminKeys = await PaymentKeys.findOneAndUpdate(
                    { 'keys._id': adminId },
                    { $set: { 'keys.$.publicKey': publicKey, 'keys.$.privateKey': privateKey, 'keys.$.enable': true } },
                    { new: true }
                );
                if (adminKeys) {
                    res.status(200).json({ message: 'Payment Keys updated Successfully' });
                    return; // Exit the function after sending the response
                }
            } else if (enable === true && rzpIdKey && rzpSecretKey) {
                const adminKeys = await PaymentKeys.findOneAndUpdate(
                    { 'razorKey._id': adminId },
                    { $set: { 'razorKey.$.rzpIdKey': rzpIdKey, 'razorKey.$.rzpSecretKey': rzpSecretKey, 'razorKey.$.enable': true } },
                    { new: true }
                );
                if (adminKeys) {
                    res.status(200).json({ message: 'Payment Keys updated Successfully' });
                    return; // Exit the function after sending the response
                }
            }
    
            res.status(404).json({ message: 'No matching document found for the given query.' });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while updating payment keys.', error });
        }
    }
    
      

async function addPaymentKeys(req, res) {
  try {
    const { publicKey, privateKey, rzpPublicKey, rzpPrivateKey } = req.body;
    const adminId = req.tokenData.id

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
    logger.error(error);
    res.status(500).json(error);
  }
}


async function deletePaymentKeys(req, res) {
  const { id } = req.body;
  console.log(id, "coming id is ");
  
  try {
    const data = await PaymentKeys.findOneAndUpdate(
      { $or: [
          { 'keys._id': id },
          { 'razorKey._id': id }
        ]
      },
      { 
        $pull: {
          keys: { _id: id },
          razorKey: { _id: id }
        }
      },
      { new: true }
    );

    if (data) {
      res.status(200).json({ message: 'Payment Key deleted Successfully' });
    } else {
      return;
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
}



// async function deletePaymentKeys(req, res) {
//   const { id } = req.body;
//   console.log(id, "coming id is ");
  

//   try {
//     const data = await PaymentKeys.findOneAndDelete({ 'keys._id': id });

//     if (data) {
//       res.status(200).json({ message: 'Payment Key deleted Successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching document found for the given query.' });
//     }
//   } catch (error) {
//     logger.error(error);
//     res.status(500).json(error);
//   }
// }

async function getRedisData(req, res) {
  try {
    await redisClient.get('payment_intent_client_secret').then((data) => {

      res.status(200).json(data);
    })
  } catch (error) {
    logger.error(error);
    return;
    res.status(500).json(error);
  }
}

module.exports = {
  deletePaymentKeys,
  updatePaymentKeys,
  getPaymentKeyPromise,
  addPaymentKeys,
  getPaymentKeys,
  getAllPaymentKeys,
  getRedisData
}