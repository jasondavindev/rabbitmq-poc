const { argv } = require('yargs');
const uuid = require('uuid/v4');
const amqp = require('amqplib');

const configs = require('../config');
const { sleep, random } = require('../utils');

async function main() {
  const consumerTag = uuid();
  const conn = await amqp.connect(configs.RABBITMQ_CONNECTION_URL);
  const channel = await conn.createChannel();

  process.once('SIGINT', async () => {
    console.log('exiting');
    await channel.cancel(consumerTag);
    await conn.close();
  });

  channel.prefetch(argv.concurrency || 1);
  await channel.assertQueue(configs.RABBITMQ_QUEUE_NAME);

  channel.consume(
    configs.RABBITMQ_QUEUE_NAME,
    async (message) => {
      console.log(message.content.toString());
      channel.ack(message);
      await sleep(random(100, 400));
    },
    { consumerTag }
  );
}

main();
