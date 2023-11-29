const mongoose = require('mongoose');

// Helper function for common fields
const createBasicField = (type, required = true) => ({ type, required });

const aboutSchema = new mongoose.Schema({
  BasicInfo: {
    content: {
      name: createBasicField(String),
      tagline: createBasicField(String),
      description: createBasicField(String),
      foundedYear: createBasicField(Number, 4),
      growthDescription: createBasicField(String),
      Feature1: {
        heading: createBasicField(String),
        description: createBasicField(String),
      },
      Feature2: {
        heading: createBasicField(String),
        description: createBasicField(String),
      },
    },
  StoreImages:  [createBasicField(String)],  
},


  TeamMembers: [

      {
        name: createBasicField(String),
        img: createBasicField(String),
      },
    ],
  },
);
module.exports = mongoose.model('About', aboutSchema);
