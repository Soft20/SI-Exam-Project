module.exports = class EnvError extends Error {
	constructor(key) {
		super(`<${key}> was undefined, did you add it to the environment file?`);
	}
}