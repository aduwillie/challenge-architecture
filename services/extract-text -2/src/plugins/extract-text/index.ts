import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IPlugin, IPluginInfo, IPluginOption } from '../../interfaces';

import { extractTextWithLimit, extractTextWithoutLimit } from '../../extract-text';

const info: IPluginInfo = {
    name: 'Extract Text',
    version: '1.0.0',
};



const register = async (server: Hapi.Server, AWS: IPluginOption): Promise<void> => {
    try {
        server.route({
            method: 'GET',
            path: '/extract-text',
            options: {
                handler: () => {
                    server.log('Extract-text');
                    return 'Extract Text';
                },
                log: {
                    collect: true,
                },
            },
        });

        server.route({
            method: 'GET',
            path: '/extract-text',
            options: {
                handler: () => {
                    server.log('Extract-text');
                    return 'Extract Text';
                },
                log: {
                    collect: true,
                },
            },
        });

        server.route({
            method: 'POST',
            path: '/extract-text',
            options: {
                validate: {
                    payload: {
                        bucket: Joi.string().required(),
                        s3Key: Joi.string().required(),
                        outputBucket: Joi.string().required(),
                    }
                },
                handler: () => {
                
                },
                log: {
                    collect: true,
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
