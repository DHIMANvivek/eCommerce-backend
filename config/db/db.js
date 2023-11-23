const mongoose = require('mongoose');
const env = require('dotenv').config(); 
rootUrl = process.env.dbURL;

mongoose.connect(rootUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
}).catch((err) => console.log(err));