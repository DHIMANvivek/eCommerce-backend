// // const fs = require('fs');
// // const { exec } = require('child_process');
// // const redis = require('redis');
// // require('dotenv').config();

// // fs.chmodSync('config/trade-vogue.pem', 0o400);

// // const redisClient = redis.createClient({
// //   host: 'clustercfg.redis.gmdmlr.memorydb.us-east-1.amazonaws.com',
// //   port: 6379,
// // });

// // function startSSHTunnel() {
// //     const sshCommand = `${process.env.REDIS} -o StrictHostKeyChecking=no`;

// //   const sshProcess = exec(sshCommand);

// //   sshProcess.on('close', (code) => {
// //     if (code === 0) {
// //       console.log(`SSH tunnel established successfully.`);
// //     } else {
// //       console.error(`Failed to establish SSH tunnel. Exit code: ${code}`);
// //     }
// //   });
// // }

// // startSSHTunnel();

// // module.exports = redisClient;

// const { createClient } =  require("redis")
              
// const redisClient = createClient ({
//   url : "rediss://default:0fd9871da5b3445485be5787efff606e@us1-wise-kit-40103.upstash.io:40103"
// });

// redisClient.on("connect", function(err, data) {
//     console.log("redis connected");
//   });

// redisClient.on("error", function(err) {
//   throw err;
// });
// redisClient.connect()
// redisClient.set('foo','bar');

//  module.exports = redisClient;