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
  
  StoreImages: {
    img: [createBasicField(String)],
  },
},
  active: createBasicField(Boolean),
  Statistics: {
    Sales: {
      Number: createBasicField(Number,false),
      color: createBasicField(String),
      active: createBasicField(Boolean),
    },
    HappyCustomers: {
      Number: createBasicField(Number,false),
      color: createBasicField(String),
      active: createBasicField(Boolean),
    },
    ShippedProducts: {
      Number: createBasicField(Number,false),
      color: createBasicField(String),
      active: createBasicField(Boolean),
    },
    active: createBasicField(Boolean),
  },
  TeamMembers: {
    memberInfo: [
      {
        name: createBasicField(String),
        imgLink: createBasicField(String),
      },
    ],
    active: createBasicField(Boolean),
  },
});

module.exports = mongoose.model('aboutPage', aboutSchema);
