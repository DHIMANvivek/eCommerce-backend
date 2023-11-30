const mongoose = require('mongoose');

const tcSchema = new mongoose.Schema(

  {
    data: [{
      heading: { type: String, required: true },
      contentInfo: [
        {
          content_type: {
            type: String,
            enum: ['list', 'paragraph'],
          },
          content_description: [
            { content: { type: String } }
          ]
        }
      ]
    }]
  }
);



module.exports = mongoose.model('T&C', tcSchema);
