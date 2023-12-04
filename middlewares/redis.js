const redisClient = require('./../config/redisClient');
const logger = require('./../logger');

const checkRedisCache = async (req, res, next) => {
    const key = req.originalUrl.slice(1);
    
    try {
        redisClient.get(key).then((data) => {
            if (data) {
                data = JSON.parse(data);
                res.status(201).json(data);
            }
            else {
                next();
            }
        })
    } catch (error) {
        logger.error(error, 'redis failed');
        res.status(401).json({ message: 'unable to fetch redis cache' });
    }
}

module.exports = checkRedisCache;