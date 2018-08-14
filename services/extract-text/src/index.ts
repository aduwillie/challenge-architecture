import { ServiceBroker, ServiceSchema } from 'moleculer';
import * as ApiGateway from 'moleculer-web';

import { extractText } from './extract-text';
import { getLocalCopyFromS3, uploadToS3 } from './s3';
import { deleteFile } from './file-system';

const broker: ServiceBroker = new ServiceBroker({
    nodeID: 'extract-text',
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
});

const service: ServiceSchema = {
    name: 'extract-text',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        port: process.env.PORT || 5005,
        routes: [{
			path: "/api",
			whitelist: [
				"**"
			],
		}],
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
                const localAbsolutePath = await getLocalCopyFromS3(bucket, key);
                const extractedText = await this.extractText(localAbsolutePath);
                const newKey = `texts/${key.replace('.pdf', '.txt')}`;
                const location: string = await uploadToS3(bucket, newKey, Buffer.from(extractedText))
                broker.emit('extract.text', { bucket, key, location, pathToClean: [ localAbsolutePath ] });
                return { bucket, key, location };
            },
        },
    },
    methods: {
        extractText,
        getServiceName: () => 'Extract Text',
        deleteFile,
    },
    events: {
        'extract.text': async (payload: any) => {
            this.logger.info('Text extracted -> ', payload);
            await this.deleteFile(payload.pathToClean);
            this.logger.info('Path cleaned -> ', payload.pathToClean);
        },
        '$node.connected': ({ node }) => {
            this.logger.info(`Node ${node.id} is connected!`);
        }
    }
};

broker.createService(service);

broker.start()
    .then((() => console.log('Broker started!!')))
