const fs = require('fs');
const { exec } = require('child_process');
const redis = require('redis');
require('dotenv').config();

// fs.chmodSync('config/trade-vogue.pem', 0o400);

// const redisClient = redis.createClient({
//   host: '127.0.0.1',
//   port: 6379,
// });

// function startSSHTunnel() {
//     const sshCommand = `${process.env.REDIS} -o StrictHostKeyChecking=no`;

//   const sshProcess = exec(sshCommand);

//   sshProcess.on('close', (code) => {
//     if (code === 0) {
//       console.log(`SSH tunnel established successfully.`);
//     } else {
//       console.error(`Failed to establish SSH tunnel. Exit code: ${code}`);
//     }
//   });
// }

// startSSHTunnel();

// module.exports = redisClient;
