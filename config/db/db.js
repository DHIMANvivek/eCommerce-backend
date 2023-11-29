const mongoose = require('mongoose');
rootUrl = process.env.dbURL;

mongoose.connect(rootUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
}).catch((err) => console.log(err));