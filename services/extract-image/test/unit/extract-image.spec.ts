import { ServiceBroker, Errors }  from "moleculer";
import { Service } from '../../src/index';

const { ValidationError }  = Errors;

describe('Extract Image Service', () => {
	let broker = new ServiceBroker();
	broker.createService(Service);

	beforeAll(() => {
		broker.start();
	});

	afterAll(() => {
		broker.stop();
	});

	describe('extract-text.ping', () => {
		it('should return with "pong"', () => {
			expect(broker.call('extract-text.ping')).toEqual('pong');
		});
	});
});

// describe("Test 'greeter' service", () => {
// 	let broker = new ServiceBroker();
// 	broker.createService(TestService);

// 	beforeAll(() => broker.start());
// 	afterAll(() => broker.stop());

// 	describe("Test 'greeter.hello' action", () => {

// 		it("should return with 'Hello Moleculer'", () => {
// 			expect(broker.call("greeter.hello")).resolves.toBe("Hello Moleculer");
// 		});

// 	});

// 	describe("Test 'greeter.welcome' action", () => {

// 		it("should return with 'Welcome'", () => {
// 			expect(broker.call("greeter.welcome", { name: "Adam" })).resolves.toBe("Welcome, Adam");
// 		});

// 		it("should reject an ValidationError", () => {
// 			expect(broker.call("greeter.welcome")).rejects.toBeInstanceOf(ValidationError);
// 		});

// 	});

// });

