const uuid = require('uuid/v4');
const amqp = require('amqplib');
const { argv } = require('yargs');

const configs = require('../config');

async function main() {
  const conn = await amqp.connect(configs.RABBITMQ_CONNECTION_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange('logs', 'fanout', {
    durable: false,
    autoDelete: false,
  });

  for (let i = 0; i < parseInt(argv.messagesCount || 1); i++) {
    await channel.publish('logs', '', Buffer.from(uuid()));
  }

  console.log('finished');
  await channel.close();
  await conn.close();
}

main();
