import * as AWS from 'aws-sdk';
import * as SQSConsumer from 'sqs-consumer';
import { ServiceBroker } from 'moleculer';

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const sqs = new AWS.SQS({ endpoint: 'http://aws:5001' });

const broker: ServiceBroker = new ServiceBroker({
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
});

interface MessageBody {
    uid: string;
    Bucket: string;
    Key: string;
};

broker.start()
    .then(() => console.log('Broker started!'))
    .then(() => {
        const QueueName = 'file-stream'
        return sqs.createQueue({ QueueName }).promise().then(d => d.QueueUrl);
    })
    .then(queueUrl => {
        return SQSConsumer.create({
            queueUrl,
            handleMessage: (message, done) => {
                const msgObj: MessageBody = JSON.parse(message.Body);
                console.log(`Processing ${msgObj}`);
                return Promise.all([
                    broker.call('v1.extract-text.extract', { bucket: msgObj.Bucket, key: msgObj.Key }),
                    broker.call('v1.extract-image.extract', { bucket: msgObj.Bucket, key: msgObj.Key }), 
                ]).then(d => {
                    done();
                });
            },
        });
    })
    .then(app => {
        app.on('err', (err) => console.log(err));

        return app.start();
    });

process.on('unhandledRejection', (err) => {
    console.log(err);
});

process.on('uncaughtException', (err) => {
    console.log(err);
});