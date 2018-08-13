import * as Hapi from 'hapi';

import { IPlugin, IPluginInfo } from '../../interfaces';

const info: IPluginInfo = {
    name: 'Swagger Documentation',
    version: '1.0.0',
};

const register = async (server: Hapi.Server): Promise<void> => {
    try {
        return server.register([
            require("inert"),
            require("vision"),
            {
                plugin: require("hapi-swagger"),
                options: {
                    info: {
                        title: "Extract Text",
                        description: "Extract Text",
                        version: "1.0"
                    },
                    tags: [
                        {
                            name: "extract-text",
                            description: "Api extract-text interface."
                        },
                    ],
                    swaggerUI: true,
                    documentationPage: true,
                    documentationPath: "/docs"
                }
            }
        ]);
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
