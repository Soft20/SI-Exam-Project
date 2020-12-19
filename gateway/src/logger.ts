import { ILogObject, Logger } from 'tslog';
import { appendFileSync } from 'fs';

function logToTransport(logObject: ILogObject) {
	appendFileSync('logs.txt', JSON.stringify(logObject) + '\n');
}

const logger: Logger = new Logger();
logger.attachTransport(
	{
		silly: logToTransport,
		debug: logToTransport,
		trace: logToTransport,
		info: logToTransport,
		warn: logToTransport,
		error: logToTransport,
		fatal: logToTransport,
	},
	'debug'
);

export default logger;
