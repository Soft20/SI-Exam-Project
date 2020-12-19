import server from '../server';

const host: string = `http://localhost:${process.env.PORT}`;

export default function hypermedia(path: string, params: object = {}, query:object = {}): object | string {
	const media: string = host + server.router.render(path, params, query);
	return media;
}