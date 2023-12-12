const PaymentKeys = require('./../../models/custom-website-elements/paymentKeys');
const logger = require('./../../logger');
const crypto = require('crypto');
require('dotenv').config();
const bcryptjs = require('bcryptjs');
const usersModel = require('../../models/users');
const { log } = require('console');

async function getstripePaymentKeyPromise(req, res) {
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

    return new Promise((res, rej) => {
      res(paymentKeys);
    })
  } catch (error) {
    console.log("error inside getPyment keys ")
    logger.error(error);
    res.status(500).json(error);
  }
}

async function getrazorPaymentKeyPromise(req, res) {
  try {
    const paymentKeys = await PaymentKeys.aggregate([
  { 
    $unwind: {
      path: "$razorKey",
    },
  },
  {
    $match: {
      "razorKey.enable": true,
    },
  } ,
  {
    $lookup: {
      from: "users",
      localField: "razorKey.adminId",
      foreignField: "_id",
      as: "keys.admin",
    },
  },
  {
    $group: {
      _id: "$_id",
        keys: {
        $push: "$razorKey",
      },
    },
  },
  ]);

    return new Promise((res, rej) => {
      res(paymentKeys);
    })
  } catch (error) {
    console.log("error inside getPyment keys ")
    logger.error(error);
    res.status(500).json(error);
  }
}

async function decryptPaymentKeys(paymentKeys) {
  const decryptedKeys = [];

   if (!Array.isArray(paymentKeys)) {

    for(const key of paymentKeys.keys){
      const { rzpIdKey,rzpSecretKey , adminId } = key;

      const decryptedPublicKey = decryptData(
        rzpIdKey.encryptedData,
        rzpIdKey.key,
        rzpIdKey.iv
      );

      console.log(decryptedPublicKey, "decryptedPublicKey is ");

      const decryptedPrivateKey = decryptData(
        rzpSecretKey.encryptedData,
        rzpSecretKey.key,
        rzpSecretKey.iv
      );

      decryptedKeys.push({
        adminId,
        decryptedPublicKey,
        decryptedPrivateKey
      });

      return decryptedKeys;

    }
   } else {
     for (const keySet of paymentKeys) {
       const { publicKey, privateKey, adminId } = keySet;
   
       if(publicKey && privateKey){
         const decryptedPublicKey = decryptData(
           publicKey.encryptedData,
           publicKey.key,
           publicKey.iv
         );
     
         const decryptedPrivateKey = decryptData(
           privateKey.encryptedData,
           privateKey.key,
           privateKey.iv
         );
     
         decryptedKeys.push({
           adminId,
           decryptedPublicKey,
           decryptedPrivateKey
         });
   }
     }
       return decryptedKeys;
   }
}


async function getPaymentKeys(req, res) {
  try {
    const paymentKeys = await getstripePaymentKeyPromise(req, res);
    const decryptedKeys = await decryptPaymentKeys(paymentKeys[0].keys);
    res.status(200).json(decryptedKeys);
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

// async function updatePaymentKeys(req, res) {
//   try {
//     const { publicKey, privateKey, id, enable, rzpIdKey, rzpSecretKey, toggle } = req.body;
//     console.log(req.body, "req.body is ");

//     const adminId = id;

//     // Disable all keys
//     if (publicKey && privateKey) {
//       await PaymentKeys.updateMany({}, { $set: { 'keys.$[].enable': false } });
//     } else if (rzpIdKey && rzpSecretKey) {
//       await PaymentKeys.updateMany({}, { $set: { 'razorKey.$[].enable': false } });
//     }

//     if (toggle === true) {
//       // Toggle mode: Only update the 'enable' state
//       if (enable === true && publicKey && privateKey) {
//         const adminKeys = await PaymentKeys.findOneAndUpdate(
//           { 'keys._id': adminId },
//           { $set: { 'keys.$.enable': true } },
//           { new: true }
//         );

//         if (adminKeys) {
//           res.status(200).json({ message: 'Payment Keys toggled to Enabled Successfully' });
//           return;
//         }
//       } else if (enable === false && publicKey && privateKey) {
//         const adminKeys = await PaymentKeys.findOneAndUpdate(
//           { 'keys._id': adminId },
//           { $set: { 'keys.$.enable': false } },
//           { new: true }
//         );

//         if (adminKeys) {
//           res.status(200).json({ message: 'Payment Keys toggled to Disabled Successfully' });
//           return;
//         }
//       }
//     } else {
//       // Full update mode: Update all fields
//       if (enable === true && publicKey && privateKey) {
//         const encryptedPublicKey = encryptData(publicKey);
//         const encryptedPrivateKey = encryptData(privateKey);

//         const adminKeys = await PaymentKeys.findOneAndUpdate(
//           { 'keys._id': adminId },
//           {
//             $set: {
//               'keys.$.publicKey': encryptedPublicKey,
//               'keys.$.privateKey': encryptedPrivateKey,
//               'keys.$.enable': true,
//             },
//           },
//           { new: true }
//         );

//         if (adminKeys) {
//           res.status(200).json({ message: 'Payment Keys updated Successfully' });
//           return;
//         }
//       } else if (enable === true && rzpIdKey && rzpSecretKey) {
//         const encryptedRzpIdKey = encryptData(rzpIdKey);
//         const encryptedRzpSecretKey = encryptData(rzpSecretKey);

//         const adminKeys = await PaymentKeys.findOneAndUpdate(
//           { 'razorKey._id': adminId },
//           {
//             $set: {
//               'razorKey.$.rzpIdKey': encryptedRzpIdKey,
//               'razorKey.$.rzpSecretKey': encryptedRzpSecretKey,
//               'razorKey.$.enable': true,
//             },
//           },
//           { new: true }
//         );

//         if (adminKeys) {
//           res.status(200).json({ message: 'Payment Keys updated Successfully' });
//           return;
//         }
//       }
//     }

//     res.status(404).json({ message: 'No matching document found for the given query.' });

//   } catch (error) {
//     res.status(500).json({ message: 'An error occurred while updating payment keys.', error });
//   }
// }

async function updatePaymentKeys(req, res) {
  try {
    const { publicKey, privateKey, id, enable, rzpIdKey, rzpSecretKey, toggle } = req.body;
    console.log(req.body, "req.body is ");

    const adminId = id;
    const isStripe = publicKey && privateKey;
    const isRazorpay = rzpIdKey && rzpSecretKey;

    // Disable all keys
    if (isStripe) {
      await PaymentKeys.updateMany({}, { $set: { 'keys.$[].enable': false } });
    } else if (isRazorpay) {
      await PaymentKeys.updateMany({}, { $set: { 'razorKey.$[].enable': false } });
    }

    if (toggle === true) {
      const updateField = isRazorpay ? 'razorKey' : 'keys';
      const fieldQuery = { [`${updateField}._id`]: { $ne: adminId } };
      const enableField = isRazorpay ? 'razorKey.$.enable' : 'keys.$.enable';

      await PaymentKeys.updateMany(fieldQuery, { $set: { [enableField]: false } });

      const adminKeys = await PaymentKeys.findOneAndUpdate(
        { [`${updateField}._id`]: adminId },
        { $set: { [`${updateField}.$.enable`]: true } },
        { new: true }
      );

      if (adminKeys) {
        const message = isRazorpay ? 'Razorpay' : 'Stripe';
        res.status(200).json({ message: `${message} Payment Keys toggled Successfully` });
        return;
      }
    } else {
      if (enable === true && isStripe) {
        const encryptedPublicKey = encryptData(publicKey);
        const encryptedPrivateKey = encryptData(privateKey);

        const adminKeys = await PaymentKeys.findOneAndUpdate(
          { 'keys._id': adminId },
          {
            $set: {
              'keys.$.publicKey': encryptedPublicKey,
              'keys.$.privateKey': encryptedPrivateKey,
              'keys.$.enable': true,
            },
          },
          { new: true }
        );

        if (adminKeys) {
          res.status(200).json({ message: 'Payment Keys updated Successfully' });
          return;
        }
      } else if (enable === true && isRazorpay) {
        const encryptedRzpIdKey = encryptData(rzpIdKey);
        const encryptedRzpSecretKey = encryptData(rzpSecretKey);

        const adminKeys = await PaymentKeys.findOneAndUpdate(
          { 'razorKey._id': adminId },
          {
            $set: {
              'razorKey.$.rzpIdKey': encryptedRzpIdKey,
              'razorKey.$.rzpSecretKey': encryptedRzpSecretKey,
              'razorKey.$.enable': true,
            },
          },
          { new: true }
        );

        if (adminKeys) {
          res.status(200).json({ message: 'Payment Keys updated Successfully' });
          return;
        }
      }
    }

    res.status(404).json({ message: 'No matching document found for the given query.' });

  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating payment keys.', error });
  }
}





function encryptData(data) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encryptedData,
    key: key.toString('hex')
  };
}

async function addPaymentKeys(req, res) {
  try {
    const { publicKey, privateKey, rzpPublicKey, rzpPrivateKey } = req.body;
    const adminId = req.tokenData.id;


    let adminKeys = await PaymentKeys.findOne({});

    if (!adminKeys) {
      adminKeys = new PaymentKeys({
        keys: [],
        razorKey: []
      });
    }

    if (publicKey && privateKey) {
      const publicEncryptedKey = encryptData(publicKey);
      const privateEncryptedKey = encryptData(privateKey);
      console.log(publicEncryptedKey, privateEncryptedKey, "coming inside encrypt keys");

      adminKeys.keys.push({ adminId, publicKey: publicEncryptedKey, privateKey: privateEncryptedKey});
    }

    if (rzpPublicKey && rzpPrivateKey) {
      const publicrazorEncryptedKey = encryptData(rzpPublicKey);
      const privaterazorEncryptedKey = encryptData(rzpPrivateKey);

      adminKeys.razorKey.push({ adminId, rzpIdKey: publicrazorEncryptedKey, rzpSecretKey: privaterazorEncryptedKey});
    }

    await adminKeys.save();
    res.status(200).json({ message: 'Payment Keys added Successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
}

function decryptData(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return JSON.parse(decryptedData);
}

async function getDecryptedPaymentKeysViaIndex(req, res) {
  try {
    const adminId = req.tokenData.id;
    const paymentKeys = await PaymentKeys.findOne({ 'keys.adminId': adminId });
    console.log(req.params.index, "coming index is ")
    if (paymentKeys.keys && paymentKeys.keys.length > 0) {
      const currentKey = paymentKeys.keys[req.params.index];

      const decryptedPublicKey = decryptData(currentKey.publicKey.encryptedData, currentKey.publicKey.key, currentKey.publicKey.iv);
      const decryptedPrivateKey = decryptData(currentKey.privateKey.encryptedData, currentKey.privateKey.key, currentKey.privateKey.iv);

      console.log('Decrypted Public Key:', decryptedPublicKey);
      console.log('Decrypted Private Key:', decryptedPrivateKey);
      res.status(200).json({ decryptedPublicKey, decryptedPrivateKey });
    } else {
      console.log('No keys found.');
    }
  } catch (error) {
    console.error('Error decrypting payment keys:', error);
  }
}

async function getDecryptedPaymentKeys(req , res) {
  
}

async function verifyPassword(req, res) {
  try {
    const userFound = await usersModel.findOne({
      email: req.tokenData.email
    }, { email: 1, name: 1, password: 1, role: 1 });

    if (!userFound) {
      return res.status(404).json({ error: 'User not found' });
    }

    const compare = await bcryptjs.compare(req.body.password, userFound.password);

    if (compare) {
      return res.status(200).json('okay');
    } else {
      throw ({message: "Please Enter Correct Password"})
    }
  } catch (err) {
    console.log('error is ',err);
        logger.error(err);
        if (err.message) return res.status(500).json(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
  }
}

async function deletePaymentKeys(req, res) {
  const { id } = req.body;
  console.log(id, "coming id is ");

  try {
    const data = await PaymentKeys.findOneAndUpdate(
      {
        $or: [
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

module.exports = {
  deletePaymentKeys,
  updatePaymentKeys,
  getstripePaymentKeyPromise,
  addPaymentKeys,
  getPaymentKeys,
  getAllPaymentKeys,
  getDecryptedPaymentKeysViaIndex,
  getDecryptedPaymentKeys,
  decryptPaymentKeys,
  getrazorPaymentKeyPromise,
  verifyPassword
}