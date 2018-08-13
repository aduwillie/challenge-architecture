import * as Hapi from 'hapi';

import { IPlugin, IPluginInfo } from '../../interfaces';

const info: IPluginInfo = {
    name: 'Good Logger',
    version: '1.0.0',
};

const register = async (server: Hapi.Server): Promise<void> => {
    try {
        return server.register({
            plugin: require('good'),
            options: {
                ops: {
                    interval: 1000
                },
                reporters: {
                    myConsoleReporter: [{
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: '*', response: '*' }]
                    }, {
                        module: 'good-console'
                    }, 'stdout'],
                    myFileReporter: [{
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ ops: '*' }]
                    }, {
                        module: 'good-squeeze',
                        name: 'SafeJson'
                    }, {
                        module: 'good-file',
                        args: ['./logs/extract-text-logs']
                    }],
                    myHTTPReporter: [{
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ error: '*' }]
                    }, {
                        module: 'good-http',
                        args: [`${server.info.uri}/logs`, {
                            threshold: 0,
                            wreck: {
                                headers: { 'x-api-key': 12345 }
                            }
                        }]
                    }]
                },
            },
        });
    } catch (error) {
        console.log(`Error registering plugin: ${info.name} (${info.version})`);
        throw error;
    }
};

export default (): IPlugin => {
    return {
        register,
        info,
    }
};
