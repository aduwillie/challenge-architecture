import { ServiceBroker, Errors }  from "moleculer";
import { GetService, IServiceOptions } from '../../src/index';

const { ValidationError }  = Errors;

describe('Extract Image Service', () => {
	let broker = new ServiceBroker();

	const bucket = 'test-bucket';
	const key = 'test-key.pdf';
	const s3Path = 's3-path';

	const testServiceOptions: IServiceOptions = {
		extractImage: jest.fn().mockReturnValue(Promise.resolve('image-path')),
		getLocalCopyFromS3: jest.fn().mockReturnValue(Promise.resolve('some-path')),
		uploadToS3: jest.fn().mockReturnValue(Promise.resolve(s3Path)),
		deleteFile: jest.fn().mockReturnValue(Promise.resolve({})),
		readFile: jest.fn().mockReturnValue(Promise.resolve('some-path')),
	};

	const TestService = GetService(testServiceOptions);
	
	beforeAll(async () => {
		TestService.name = 'test-extract-image';
		TestService.settings.port = 3000;

		broker.createService(TestService);
		broker.logger.info = jest.fn();

		await broker.start();
	});

	afterAll(async () => {
		await broker.stop();
	});
	

	it('v1.extract-image.ping', () => {
		expect(broker.call('v1.test-extract-image.ping')).resolves.toEqual('pong');
	});

	it('extract-image fail scenarios', async () => {
		await expect(broker.call('v1.test-extract-image.extract', { bucket })).rejects.toBeInstanceOf(ValidationError);
		await expect(broker.call('v1.test-extract-image.extract', { key })).rejects.toBeInstanceOf(ValidationError);
	});

	it('extract-image pass scenarios', async () => {
		const result = await broker.call('v1.test-extract-image.extract', { bucket, key });
		expect(result.bucket).toEqual('images');
		expect(result.key).toEqual(key.replace('.pdf', '.txt'));
		expect(result.location).toEqual(s3Path);
	});
});
