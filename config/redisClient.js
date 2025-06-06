const { createClient } = require("redis")

const redisClient = createClient({
    url: "rediss://default:AbZ3AAIjcDFkNjhhNjE3Y2JjNWM0MjE0OWZlODJlYjhiZjQwNGZmNHAxMA@cute-sailfish-46711.upstash.io:6379"
});

redisClient.on("connect", function (err, data) {
    console.log("redis connected");
});

redisClient.on("error", function (err) {
    throw err;
});
redisClient.connect()
redisClient.set('foo', 'bar');

module.exports = redisClient;