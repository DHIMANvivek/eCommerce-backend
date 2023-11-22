const mongoose = require('mongoose');

const tcSchema = new mongoose.Schema(
  
  {data:[{
    heading: { type: String, required: true }, 
    contentInfo:[
      {
        content_type:{
          type:String,
          enum: ['list', 'paragraph'],
          validate:function validator(){
            console.log('value is ',this);
          }
        },
        content_description: {
          type: mongoose.Schema.Types.Mixed,
          validate: {
                        validator: function (value) {
                          const content_type = this.content_type; // Use this.get() to access the field value
                          console.log('content type is ', content_type);
            
                          if (content_type === 'list') {
                            // Array is expected for bullet type
                            return Array.isArray(value);
                          } else if (content_type === 'paragraph') {
                            // String is expected for paragraph type
                            return typeof value === 'string';
                          }
            
                          // Invalid content_type
                          return false;
                        },
                        message: 'Invalid content_description for the given content_type',
                      },
        }
      }
      
    ]
  }]}
);



module.exports = mongoose.model('T&C', tcSchema);
