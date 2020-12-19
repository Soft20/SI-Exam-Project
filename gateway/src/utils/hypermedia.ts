import server from '../server';

// ATT:: to .evn
const host: string = 'http://localhost:8080';

export function hypermedia(path: string, params: object = {}, methods: string[] = ['GET']): object | string {
	// const media: any = { methods, ref: host + server.router.render(path, params) };
	const media: string = host + server.router.render(path, params);
	return media;
}