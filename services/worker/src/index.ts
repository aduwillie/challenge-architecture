import * as AWS from 'aws-sdk';
import { ServiceBroker } from 'moleculer';

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const sqs = new AWS.SQS({ endpoint: 'http://aws:5001' });

const broker: ServiceBroker = new ServiceBroker({
    nodeID: 'worker',
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
    metrics: true,
});

interface MessageBody {
    uid: string;
    Bucket: string;
    Key: string;
};

const QueueName = 'file-stream';
let QueueUrl;

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const queueNextPoll = async () => {
    await wait(5000);
    await getNextMessage();
};

const getNextMessage = async () => {
    try {
        if (!QueueUrl) {
            const getQueueResponse = await sqs.getQueueUrl({ QueueName }).promise();
            QueueUrl = getQueueResponse.QueueUrl;
        }
        const receivedMessage = await sqs.receiveMessage({ QueueUrl, VisibilityTimeout: 5000 }).promise();
        const rawMessage = receivedMessage.Messages[0];
        broker.logger.info(`[${rawMessage.MessageId}] Processing: ${rawMessage.Body}`);

        const parsedMessage = JSON.parse(rawMessage.Body);
        await broker.call('v1.extract-text.extract', { bucket: parsedMessage.Bucket, key: parsedMessage.Key }, {
            timeout: 500,
            retries: 3,
            fallbackResponse: (ctx, err) => {
                broker.logger.error(`[Extract Text] issues: ${err}`);
            }, 
        });
        await broker.call('v1.extract-image.extract', { bucket: parsedMessage.Bucket, key: parsedMessage.Key }, {
            timeout: 500,
            retries: 3,
            fallbackResponse: (ctx, err) => `[Extract Text] issues: ${err}`, 
        });

        await wait(5000);
        const delMessageResult = await sqs.deleteMessage({ QueueUrl, ReceiptHandle: rawMessage.ReceiptHandle }).promise();
        
        await queueNextPoll();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

broker.start()
    .then(() => console.log('Broker Started!'))
    .then(queueNextPoll);
