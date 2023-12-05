const TicketStatus = require('../../models/support-ticket/TicketStatus');
const supportTicket = require('../../models/support-ticket/supportTicket');
const supportNotificationTokens = require('../../models/support-ticket/supportNotificationTokens');

const getTicketStatus = async (req, res) => {
  try {
    const response = await TicketStatus.find({})
    if (response) {
      return res.status(200).json(response);
    }
    throw "404";
  } catch (err) {
    return res.status(404).send();
  }
};

const webPushTokenDetails = async (req, res) => {
  try {
    const { email, token } = req.body;
    const supportNotification = await supportNotificationTokens.findOne({});

    if (supportNotification) {
      if (!email && token) {
        supportNotification.tokenDetail.push({ token });
        await supportNotification.save();
        res.status(200).json(supportNotification);
      } else {
        const existingEntryIndex = supportNotification.tokenDetail.findIndex(
          (entry) => entry.email === email
        );

        if (existingEntryIndex !== -1) {
          if (token) {
            supportNotification.tokenDetail[existingEntryIndex].token = token;
            await supportNotification.save();
            res.status(200).json(supportNotification);
          } else {
            res.status(400).json({ error: 'Token is required for updating an entry' });
          }
        } else {
          supportNotification.tokenDetail.push({ token, email });
          await supportNotification.save();
          res.status(200).json(supportNotification);
        }
      }
    } else {
      res.status(404).json({ error: 'SupportNotifications document not found' });
    }
  } catch (error) {
    console.error('Error saving user details:', error);
    return res.status(500).json({ error: 'An error occurred while saving user details' });
  }
}

const supportTickets = async (req, res) => {
  try {
    const TicketStatuses = await TicketStatus.findOne({ title: req.body.selectedTicket });
    const webPushId = await supportNotificationTokens.find({});

    if (!TicketStatuses) {
      return res.status(404).json({ error: 'TicketStatus not found' });
    }

    const newTicket = new supportTicket({
      userName: req.body.name,
      userEmail: req.body.email,
      //   status: '',
      //   action: '',
      ticketTypes: req.body.selectedTicket,
      message: req.body.message,
      TicketStatus: { title: TicketStatuses },
      notificationDetails: webPushId
    });

    const savedTicket = await newTicket.save();

    return res.status(200).json(savedTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'An error occurred while creating the ticket' });
  }
}

const updateTicketTitle = async (req, res) => {
  try {
    const { oldTitle, newTitle, _id } = req.body;

    if (!oldTitle || !newTitle) {
      return res.status(400).json({ error: 'Both oldTitle and newTitle are required' });
    }

    const result = await TicketStatus.findOneAndUpdate(
      {
        'title': oldTitle,
      },
      {
        $set: {
          'title.$': newTitle,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Title not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating title' });
  }
}

const addTicketTitle = async (req, res) => {
  try {
    const { _id, newTitle } = req.body;

    if (!newTitle) {
      return res.status(400).json({ error: 'New title is required' });
    }

    const result = await TicketStatus.findByIdAndUpdate(
      _id,
      {
        $push: {
          title: newTitle,
          // status: { $each: defaultStatusValues } 
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error adding title' });
  }
}

const deleteTicketTitle = async (req, res) => {
  try {
    const { _id, title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    //   const ticketTypeId = '6534ab7f7033d7d5a6f71b22'; 
    const result = await TicketStatus.findByIdAndUpdate(
      _id,
      { $pull: { title: title } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Title not found' });
    }

    return res.status(200).json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting title' });
  }
}

const getAllTickets = async (req, res) => {
  try {
    const { search, currentPage = 1, limit = 10 } = req.query;
    const query = search ? { userName: search } : {};

    const response = await supportTicket.find(query)
      .skip((currentPage - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: 'TicketStatus.title',
      })
      .populate({
        path: 'notificationDetails'
      });

    if (response && response.length > 0) {
      return res.status(200).json(response);
    }
    return;
  } catch (err) {
    return res.status(404).send(err);
  }
};




// const ticketSearch = async (parameters) => {
//   try {
//     const skip = (parameters.currentPage - 1) * parameters.limit;
//     const limit = parameters.limit;

//     const query = { $regex: parameters.search, $options: "i" };
//     let aggregationPipe = [
//       {
//         $match: {
//           "status": 'open',
//           $or: [
//             { userName: query },
//           ],
//         },
//       },
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           count: {
//             $sum: 1,
//           },
//           document: {
//             $push: "$$ROOT",
//           },
//         },
//       },
//       {
//         $project: {
//           count: 1,
//           document: { $slice: ['$document', skip, limit] },
//         },
//       }
//     ];

//     const data = await supportTicket.aggregate(aggregationPipe);
//     return data || []; 
//   } catch (error) {
//     console.log(error);
//   }
// }

// const combinedticketSearch = async (req, res) => {
//   try {
//     const supportTickets = await getAllTickets();

//     // Assuming you're passing the necessary parameters for the ticket search
//     const searchData = await ticketSearch(req.body);

//     // Combine the data as needed and send it in a single response
//     // const combinedData = {
//     //   supportTickets,
//     //   searchData
//     // };

//     res.status(200).json(supportTickets);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }

// async function ticketSearch(req, res) {
//   try {

//    let parameters =req.body; 
//     const skip =  (parameters.currentPage - 1) * parameters.limit ;
//     const limit= parameters.limit;

//     const query = { $regex: parameters.search, $options: "i" };
//     let aggregationPipe = [
//       {
//         $match: {
//           "status.deleted": false,
//           $or: [
//             { OfferType: query },
//             { discountType: query },
//             { Title: query },
//             { couponcode: query },
//           ],
//         },
//       },
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           count: {
//             $sum: 1,
//           },
//           document: {
//             $push: "$$ROOT",
//           },
//         },
//       },
//       {
//         $project: {
//           count: 1,
//           document: { $slice: ['$document', skip, limit] },
//         },
//       }
//     ];


//     const data=await OfferModel.aggregate(aggregationPipe);
//     res.status(200).json(data);

//   } catch (error) {
//     logger.error(error);
//     res.status(500).json({message:'Internal Server Error'});

//   }
// }

const updateTicket = async (req, res) => {
  try {
    console.log('notification working and updated ', req.body)
    const { _id, status } = req.body;
    const result = await supportTicket.findByIdAndUpdate(
      _id,
      { $set: { status: status } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket status updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating ticket status' });
  }
}

const deleteTicket = async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await supportTicket.findByIdAndDelete(_id);

    if (!result) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting ticket' });
  }
}



module.exports = {
  getTicketStatus,
  webPushTokenDetails,
  supportTickets,
  updateTicketTitle,
  addTicketTitle,
  deleteTicketTitle,
  getAllTickets,
  updateTicket,
  deleteTicket,
  // combinedticketSearch
}