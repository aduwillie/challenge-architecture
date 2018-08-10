import * as Hapi from 'hapi';

import { IPlugin, IPluginInfo } from '../../interfaces';

const info: IPluginInfo = {
    name: 'Health',
    version: '1.0.0',
};

const register = async (server: Hapi.Server): Promise<void> => {
    try {
        server.route({
            method: 'GET',
            path: '/health',
            options: {
                handler: () => 'This is healthy',
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
