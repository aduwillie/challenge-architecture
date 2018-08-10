import * as Hapi from 'hapi';
import { S3, SQS } from 'aws-sdk';

import * as Server from './server';
import { IServerConfiguration } from './interfaces';

const s3 = new S3({
    endpoint: 'http://aws:5000',
    s3ForcePathStyle: true
});

const sqs = new SQS({
    endpoint: 'http://aws:5001'
});

const serverConfig: IServerConfiguration = {
    port: process.env.PORT,
    plugins: ['logger', 'swagger', 'health', 'logs', 'extract-text'],
};

const start = async serverConfig => {
    try {
        const server = await Server.init(serverConfig, { S3: s3, SQS: sqs });
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    } catch (error) {
        console.log(`Error starting server: ${error}`);
        throw error;
    }
};

start(serverConfig);

process.on('uncaughtException', (error: Error) => {
    console.log(`Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', (error: Error) => {
    console.log(`Unhandled Rejection: ${error.message}`);
});
