import * as Hapi from 'hapi';
import * as Path from 'path';

const server = new Hapi.Server({
    port: process.env.PORT,
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public'),
        },
    },
});

const start = async () => {
    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/',
        options: {
            handler: (req: Hapi.Request, h: Hapi.ResponseToolkit | { file: any}) => {
                return h.file('index.html');
            },
        },
    });
}
