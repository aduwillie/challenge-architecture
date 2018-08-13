import * as Hapi from 'hapi';
import { S3, SQS } from 'aws-sdk';

export interface IServerConfiguration {
    port: string;
    plugins: Array<string>;
};

export interface IDatabaseConfiguration {
    connectionString: string;
};

export interface IPluginOption {
    S3: S3,
    SQS: SQS,
};

export interface IPluginInfo {
    name: string;
    version: string;
}

export interface IPlugin {
    register(server: Hapi.Server, options?: IPluginOption);
    info: IPluginInfo;
}
