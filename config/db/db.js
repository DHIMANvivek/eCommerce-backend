const mongoose = require('mongoose');

mongoose.connect('your_url', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('connection successful');
}).catch((err) => console.log(err));