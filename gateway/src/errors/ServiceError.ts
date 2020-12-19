import logger from '../logger';
export default class ServiceError extends Error {
	status: number;

	constructor(msg: string, status: number) {
		super(msg);
		this.status = status;
		logger.error(status, msg);
		Object.setPrototypeOf(this, ServiceError.prototype);
	}
}
