const printLogger = require('./printLogger');
const productionLogger = require('./productionLogger');

let logger = null;

if (process.env.NODE_ENV === 'production'){
    logger = productionLogger();
}

if (process.env.NODE_ENV !== 'production') {
    logger = printLogger();
}
module.exports = logger;