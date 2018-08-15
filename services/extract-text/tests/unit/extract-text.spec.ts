import { ServiceBroker, Errors }  from "moleculer";
import { GetService, IServiceOptions } from '../../src';

const { ValidationError }  = Errors;

describe('Extract Text Service', () => {
	let broker = new ServiceBroker();

	const bucket = 'test-bucket';
	const key = 'test-key';
	const s3Path = 's3-path';

	const testServiceOptions: IServiceOptions = {
		extractText: jest.fn().mockReturnValue(Promise.resolve('image-path')),
		getLocalCopyFromS3: jest.fn().mockReturnValue(Promise.resolve('some-path')),
		uploadToS3: jest.fn().mockReturnValue(Promise.resolve(s3Path)),
		deleteFile: jest.fn().mockReturnValue(Promise.resolve({})),
	};

	const TestService = GetService(testServiceOptions);
	
	beforeAll(async () => {
		TestService.name = 'test-extract-text';
		TestService.settings.port = 3000;

		broker.createService(TestService);
		broker.logger.info = jest.fn();

		await broker.start();
	});

	afterAll(async () => {
		await broker.stop();
	});
	

	it('v1.extract-image.ping', () => {
		expect(broker.call('v1.test-extract-text.ping')).resolves.toEqual('pong');
	});

	it('fail scenarios', async () => {
		await expect(broker.call('v1.test-extract-text.extract', { bucket })).rejects.toBeInstanceOf(ValidationError);
		await expect(broker.call('v1.test-extract-text.extract', { key })).rejects.toBeInstanceOf(ValidationError);
	});

	it('pass scenarios', async () => {
		const result = await broker.call('v1.test-extract-text.extract', { bucket, key });
		expect(result.bucket).toEqual(bucket);
		expect(result.key).toEqual(key);
		expect(result.location).toEqual(s3Path);
	});
});
