import * as PromService from 'moleculer-prometheus';
import { ServiceBroker, ServiceSchema } from 'moleculer';
import * as ApiGateway from 'moleculer-web';

import { extractText } from './extract-text';
import { getLocalCopyFromS3, uploadToS3 } from './s3';
import { deleteFile } from './file-system';

export interface IServiceOptions {
    extractText: (pathToPdf: string) => Promise<string>;
    getLocalCopyFromS3: (bucket:string, key: string) => Promise<string>;
    uploadToS3: (bucket: string, key: string, body: string | Buffer | ReadableStream) => Promise<any>;
    deleteFile: (filename: string | string[]) => Promise<any>;
};

const BUCKET_NAME = 'texts';

const broker: ServiceBroker = new ServiceBroker({
    nodeID: 'extract-text',
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
    metrics: true,
});

export const GetService: (options: IServiceOptions) => ServiceSchema = ({ extractText, getLocalCopyFromS3, uploadToS3, deleteFile }) =>  ({
    name: 'extract-text',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        port: process.env.PORT || 5005,
    },
    actions: {
        ping: () => 'pong',
        extract: {
            params: {
                bucket: 'string',
                key: 'string',
            },
            handler: async (ctx) => {
                const { bucket, key } = ctx.params;
                const localAbsolutePath = await getLocalCopyFromS3(bucket, key);
                const extractedText = await extractText(localAbsolutePath);
                const newKey: string = key.replace('.pdf', '.txt');
                const location: string = await uploadToS3(bucket, newKey, Buffer.from(extractedText));
                const returnObj = { bucket: BUCKET_NAME, key: newKey, location };
                broker.emit('extract.text', Object.assign(returnObj, { pathToClean: [ localAbsolutePath ] }));
                return returnObj;
            },
        },
    },
    methods: {
        getServiceName: () => 'Extract Text',
    },
    events: {
        'extract.text': async (payload: any) => {
            this.logger.info('Text extracted -> ', payload);
            await deleteFile(payload.pathToClean);
            this.logger.info('Path cleaned -> ', payload.pathToClean);
        },
        '$node.connected': ({ node }) => {
            this.logger.info(`Node ${node.id} is connected!`);
        }
    }
});

broker.createService(GetService({
    extractText,
    getLocalCopyFromS3,
    uploadToS3,
    deleteFile,
}));

broker.start()
    .then((() => console.log('Broker started!!')))
