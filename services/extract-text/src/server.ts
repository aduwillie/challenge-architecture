import * as Hapi from 'hapi';
import { S3, SQS } from 'aws-sdk';

import { IServerConfiguration, IPlugin, IPluginOption, IAWS } from './interfaces';

export const init = async (serverConfig: IServerConfiguration, aws: IAWS): Promise<Hapi.Server> => {
    try {
        const server = new Hapi.Server({
            port: serverConfig.port || process.env.PORT,
            routes: {
                cors: { origin: ['*'] },
            },
        });
    
        const pluginOptions: IPluginOption = aws;
        let pluginPromises: Promise<any>[] = [];
    
        serverConfig.plugins.forEach((pluginName: string) => {
            const plugin: IPlugin = require(`./plugins/${pluginName}`).default();
            pluginPromises.push(plugin.register(server, pluginOptions));
        });
    
        await Promise.all(pluginPromises);
        console.log('Plugins registered successfully!!');
    
        server.events.on('log', (event: Hapi.LogEvent, tags) => {
            if (tags.error) {
                console.log(`Server error: ${event.error ? event.error : 'unknown error'}`);
            }
            else {
                console.log(event);
            }
        });

        return server;
    } catch (error) {
        console.log('Error initializing server: ', error);
        throw error;
    }
};
