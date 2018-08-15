import * as PromService from 'moleculer-prometheus';
import { ServiceBroker, ServiceSchema } from 'moleculer';
import * as ApiGateway from 'moleculer-web';

import { extractImage } from './extract-image';
import { getLocalCopyFromS3, uploadToS3 } from './s3';
import { deleteFile, readFile } from './file-system';

export interface IServiceOptions {
    extractImage: (pathToPdf: string, pageLength: number) => Promise<string>;
    getLocalCopyFromS3: (bucket:string, key: string) => Promise<string>;
    uploadToS3: (bucket: string, key: string, body: string | Buffer | ReadableStream) => Promise<any>;
    deleteFile: (filename: string | string[]) => Promise<any>;
    readFile: (filename: string) => Promise<any>;
};

const broker: ServiceBroker = new ServiceBroker({
    nodeID: 'extract-image',
    logger: true,
    logLevel: 'info',
    logFormatter: 'default',
    transporter: "nats://nats:4222",
    metrics: true,
});

export const GetService: (options: IServiceOptions) => ServiceSchema = ({ extractImage, getLocalCopyFromS3, uploadToS3, deleteFile, readFile }) => ({
    name: 'extract-image',
    version: 1,
    mixins: [ApiGateway],
    settings: {
        port: process.env.PORT || 5006,
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
                const combinedImagePath = await extractImage('localAbsolutePath', 10);
                const imageBuffer = await readFile(combinedImagePath);
                const newKey = `images/${key.replace('.pdf', '.png')}`;
                const location: string = await uploadToS3(bucket, newKey, imageBuffer);
                broker.emit('extract.image', { bucket, key, location, pathToClean: [ localAbsolutePath, combinedImagePath ] });
                return { bucket, key, location };
            },
        },
    },
    methods: {
        getServiceName: () => 'Extract Text',
    },
    events: {
        'extract.image': async (payload: any) => {
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
    extractImage, 
    getLocalCopyFromS3, 
    uploadToS3, 
    deleteFile, 
    readFile
}));

broker.start()
    .then((() => console.log('Broker started!!')))
