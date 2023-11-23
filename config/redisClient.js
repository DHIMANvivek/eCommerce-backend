const fs = require('fs');
const { exec } = require('child_process');
const redis = require('redis');
require('dotenv').config();

fs.chmodSync('config/trade-vogue.pem', 0o400);

const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

function startSSHTunnel(callback) {
    const sshCommand = `${process.env.REDIS} -o StrictHostKeyChecking=no`;

  const sshProcess = exec(sshCommand);

  sshProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`SSH tunnel established successfully.`);
      callback();
    } else {
      console.error(`Failed to establish SSH tunnel. Exit code: ${code}`);
    }
  });
}

function performRedisOperations() {
  console.log('Performing Redis operations');
  redisClient.set('myKey', 'myValue', (err, reply) => {
    if (err) {
      console.error('Error setting value:', err);
    } else {
      console.log('Value set in Redis:', reply);
    }
    redisClient.quit(); 
  });
}

startSSHTunnel(() => {
  redisClient.on('ready', () => {
    console.log('Redis client connected and ready');
    performRedisOperations();
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
});

module.exports = redisClient;
