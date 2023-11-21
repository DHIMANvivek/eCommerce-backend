const mongoose = require('mongoose');

const tcSchema = new mongoose.Schema(
 
    {
      heading: { type: String, required: true },
      contentInfo: [
        {
          content_type: {
            type: String,
            enum: ['list', 'paragraph'],
            required: true,
          },


          content_description: {
            type: mongoose.Schema.Types.Mixed,
            validate: {
              validator: function (value) {
                console.log('content type is ',this.content_type);
                if (this.content_type === 'bullet') {
                  // Array is expected for bullet type
                  return Array.isArray(value);
                } else if (this.content_type === 'paragraph') {
                  // String is expected for paragraph type
                  return typeof value === 'string';
                }
                // Invalid content_type
                return false;
              },
              message: 'Invalid content_description for the given content_type',
            },
          },
          
        },
      ],
    },
  
);

module.exports = mongoose.model('YourModelName', tcSchema);
