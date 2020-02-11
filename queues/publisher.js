const uuid = require('uuid/v4');
const { argv } = require('yargs');
const amqp = require('amqplib');

const configs = require('../config');
const { chunkfy } = require('../utils');

async function main() {
  const conn = await amqp.connect(configs.RABBITMQ_CONNECTION_URL);

  const channel = await conn.createChannel();
  await channel.assertQueue(configs.RABBITMQ_QUEUE_NAME);

  const messages = Array(argv.messagesCount || 1).fill(1);

  for (const chunkMessages of chunkfy(messages, 10)) {
    chunkMessages.forEach(() => {
      channel.sendToQueue(configs.RABBITMQ_QUEUE_NAME, Buffer.from(uuid()));
    });
  }

  console.log('Finished');

  await channel.close();
  await conn.close();
}

main();
