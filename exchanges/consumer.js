const uuid = require('uuid/v4');
const amqp = require('amqplib');
const { argv } = require('yargs');

const configs = require('../config');
const { sleep, random } = require('../utils');

async function main() {
  const consumerTag = uuid();
  const conn = await amqp.connect(configs.RABBITMQ_CONNECTION_URL);
  const channel = await conn.createChannel();
  await channel.prefetch(argv.concurrency || 1);

  process.once('SIGINT', async () => {
    console.log('exiting');
    await channel.cancel(consumerTag);
    await conn.close();
  });

  const queue1 = await channel.assertQueue('queue1');
  const queue2 = await channel.assertQueue('queue2');

  await channel.bindQueue(queue1.queue, 'logs', '');
  await channel.bindQueue(queue2.queue, 'logs', '');

  defaultConsume(channel, queue1.queue);
  defaultConsume(channel, queue2.queue);
}

async function defaultConsume(channel, queue) {
  channel.consume(queue, async (message) => {
    console.log('Data %s from queue %s', message.content.toString(), queue);
    channel.ack(message);
    await sleep(random(100, 400));
  });
}

main();
