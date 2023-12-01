const notificationModel = require('../../models/notifications/notifications');
const supportNotificationTokens = require('../../models/support-ticket/SupportNotificationTokens');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('../../tradevogue-firebase-adminsdk-mohjp-c7361ba1b1.json');

// private keys of notification in env 
serviceAccount.private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
serviceAccount.client_email = process.env.GOOGLE_CLIENT_EMAIL;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const getfcmToken = async (req, res) => {
  const supportNotification = await supportNotificationTokens.findOne({});
  if (supportNotification) {
    const distinctTokens = await supportNotificationTokens.aggregate([
      { $match: { _id: supportNotification._id } },
      { $unwind: '$tokenDetail' },
      { $group: { _id: null, distinctTokens: { $addToSet: '$tokenDetail.token' } } },
      { $project: { _id: 0, distinctTokens: 1 } }
    ]);
    res.status(200).send(distinctTokens[0].distinctTokens);
  } else {
  }
}

const getNotification = async (req, res) => {
  try {
    const notifications = await notificationModel.find();

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

const setNotification = async (req, res) => {
  try {
    const incomingNotifications = req.body.notification;

    if (!Array.isArray(incomingNotifications)) {
      return res.status(400).json({ message: 'Invalid notification data. Expected an array.' });
    }

    const createdNotifications = [];

    for (const incomingNotification of incomingNotifications) {
      const { icon, title, body, url } = incomingNotification;

      if (!icon || !title || !body || !url) {
        return res.status(400).json({ message: 'Invalid notification data. Required fields are missing.' });
      }

      const createdNotification = await notificationModel.create({
        notification: {
          icon,
          title,
          body,
          url,
        },
        state: true,
      });

      createdNotifications.push(createdNotification);
    }

    res.status(200).json({ message: "Notifications inserted successfully", data: createdNotifications });
  } catch (error) {
    console.error('Failed to insert NOTIFICATIONS:', error);
    res.status(500).json({ message: 'Failed to insert notifications' });
  }
}

const updateNotifications = async (req, res) => {
  try {
    const { index, data } = req.body;

    if (index !== undefined) {
      const notificationItems = await notificationModel.find({});
      if (index >= notificationItems.length) {
        return res.status(404).json({ message: 'Index out of range' });
      }

      const updateData = data.notification[0];

      // Update the notification field directly
      const updatedItem = await notificationModel.findOneAndUpdate(
        { _id: notificationItems[index]._id },
        { notification: updateData },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.status(200).json({ message: 'Item updated successfully', updatedItem });
    } else {
      const newItem = await Notification.create(data);
      res.status(200).json({ message: 'New item added successfully', newItem });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const toggleNotification = async (req, res) => {
  try {
    const { id, state } = req.body;
    const filter = { _id: id };
    const update = { state: state };

    const updatedNotifications = await notificationModel.findOneAndUpdate(filter, update, { new: true });

    if (!updatedNotifications) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification updated successfully', updatedNotifications });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

const sendNotification = async (req, res) => {
  const { title, body, icon, url, token, registration_ids } = req.body;

  console.log(":send notification clicked--------->");
  try {
    if (req.tokenData.role === 'admin') {
      const tokens = registration_ids || [token].filter(Boolean);
      const message = {
        notification: {
          title,
          body,
          image: icon
        },
        data: {
          url: String(url) || null
        },
        tokens: tokens,
      };
      admin.messaging().sendMulticast(message)
        .then((response) => {
          res.status(200).json('Notification sent successfully');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          res.status(500).json('Error sending notification');
        });
    }
  } catch (error) {
    console.log(error, "error is");
  }
}

async function deleteNotification(req, res) {
  const { _id } = req.body;
  try {
    const deletedNotification = await notificationModel.findByIdAndDelete(_id);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the sale' });
  }
}

const comingNotification = async (req, res) => {
  try {
    const notifications = await notificationModel.find();

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



module.exports = {
  getfcmToken,
  getNotification,
  setNotification,
  updateNotifications,
  toggleNotification,
  comingNotification,
  sendNotification,
  deleteNotification
}