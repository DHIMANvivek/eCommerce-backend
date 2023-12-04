const { createClient } = require("redis")

const redisClient = createClient({
    url: "rediss://default:31f65167c5264c6294190242a6ad6b37@strong-eel-43513.upstash.io:43513"
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