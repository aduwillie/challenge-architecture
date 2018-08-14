import * as Path from 'path';
import { S3 } from 'aws-sdk';
import { writeToFile } from './file-system';

const s3 = new S3({
    endpoint: 'http://aws:5000',
    s3ForcePathStyle: true,
    region: process.env.AWS_REGION || 'us-east-1',
});

export const getLocalCopyFromS3 = async (bucket: string, key: string): Promise<string> => {
    try {
        const timeStamp: number = +new Date();
        await (s3.getBucketAcl({ Bucket: bucket }).promise());
        const data = await (s3.getObject({ Bucket: bucket, Key: key }).promise());
        const localFilePath = Path.resolve(__dirname, 'temp-files', timeStamp.toString(), key);
        await  writeToFile(localFilePath, data).then;
        return localFilePath;
    } catch (error) {
        throw new Error(error);
    }
};

export const uploadToS3 = async (bucket: string, key: string, body: Buffer | string | ReadableStream): Promise<any> => {
    try {
        await (s3.getBucketAcl({ Bucket: bucket }).promise());
        const params = { Bucket: bucket, Key: key, Body: body };
        var data = await (s3.upload(params,).promise());
        return data.Location;
    } catch (error) {
        throw new Error(error);
    }
}
