import { ServiceBroker, Errors }  from "moleculer";
import { Service } from '../../src/index';

const { ValidationError }  = Errors;

describe('Extract Image Service', () => {
	let broker = new ServiceBroker();
	const TestService = Object.assign({}, Service);

	const bucket = 'test-bucket';
	const key = 'test-key';
	
	beforeAll(async () => {
		TestService.name = 'test-extract-image';
		TestService.settings.port = 3000;
		
		TestService.methods.getLocalCopyFromS3 = jest.fn().mockReturnValue(Promise.resolve('some-path'));
		TestService.methods.extractImage = jest.fn().mockReturnValue('image-path');
		TestService.methods.readFile = jest.fn().mockReturnValue('some-path');
		TestService.methods.uploadToS3 = jest.fn().mockReturnValue('s3-path');
		TestService.methods.deleteFile = jest.fn().mockReturnValue({});

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

	it('fail scenarios', async () => {
		await expect(broker.call('v1.test-extract-image.extract', { bucket })).rejects.toBeInstanceOf(ValidationError);
		await expect(broker.call('v1.test-extract-image.extract', { key })).rejects.toBeInstanceOf(ValidationError);
	});

	// it('pass scenarios', async () => {
	// 	const result = await broker.call('v1.test-extract-image.extract', { bucket, key }); 
	// 	console.log(result);
	// 	expect(result).toBe({ bucket, key, location: 's3-path' });
	// 	expect(broker.getLocalCopyFromS3).not.toEqual(undefined);
	// });
});
