'use strict';

const { ServiceBroker } = require('moleculer');
const { ServiceNotFoundError } = require('moleculer').Errors;
const TestService = require('../../services/api.service');

describe("Test 'APIGateway' service", () => {
    let broker = new ServiceBroker({ logger: false });
    broker.createService(TestService);

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    describe("Test 'auth.login' action", () => {
        it('should return an error', () => {
            expect(broker.call('greeter.hello')).rejects.toThrow(ServiceNotFoundError);
        });
    });
});
