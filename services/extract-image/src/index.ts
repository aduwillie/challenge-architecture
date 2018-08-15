import * as PromService from 'moleculer-prometheus';
import { ServiceBroker, ServiceSchema } from 'moleculer';
import * as ApiGateway from 'moleculer-web';

import { extractImage } from './extract-image';
import { getLocalCopyFromS3, uploadToS3 } from './s3';
import { deleteFile, readFile } from './file-system';

const broker: ServiceBroker = new ServiceBroker({
    nodeID: 'extract-image',
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
    metrics: true,
});

export const Service: ServiceSchema = {
    name: 'extract-image',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        port: process.env.PORT || 5006,
        // collectDefaultMetrics: true,
        // timeout: 5 * 1000,
        // routes: [{
		// 	path: "/api",
		// 	whitelist: [
		// 		"**"
		// 	],
		// }],
    },
    actions: {
        ping: () => 'pong',
        extract: {
            params: {
                bucket: 'string',
                key: 'string',
            },
            handler: async (ctx) => {
                const { bucket, key, filename } = ctx.params;
                const localAbsolutePath = await this.getLocalCopyFromS3(bucket, key);
                const combinedImagePath = await this.extractImage('localAbsolutePath', 10);
                const imageBuffer = await this.readFile(combinedImagePath);
                const newKey = `images/${key.replace('.pdf', '.png')}`;
                const location: string = await this.uploadToS3(bucket, newKey, imageBuffer);
                broker.emit('extract.image', { bucket, key, location, pathToClean: [ localAbsolutePath, combinedImagePath ] });
                return { bucket, key, location };
            },
        },
    },
    methods: {
        getServiceName: () => 'Extract Text',
        getLocalCopyFromS3: async(bucket, key) => {
            await getLocalCopyFromS3(bucket, key);
        },
        extractImage,
        uploadToS3,
        readFile,
        deleteFile,
    },
    events: {
        'extract.image': async (payload: any) => {
            this.logger.info('Text extracted -> ', payload);
            await this.deleteFile(payload.pathToClean);
            this.logger.info('Path cleaned -> ', payload.pathToClean);
        },
        '$node.connected': ({ node }) => {
            this.logger.info(`Node ${node.id} is connected!`);
        }
    }
};

broker.createService(Service);

broker.start()
    .then((() => console.log('Broker started!!')))
