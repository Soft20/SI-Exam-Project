export default class EnvError extends Error {
	constructor(key: string) {
		super(`<${key}> was undefined, did you add it to the environment file?`);
	}
}
