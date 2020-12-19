export default class ServiceError extends Error {
	status: number;

	constructor(msg: string, status: number) {
		super(msg);
		this.status = status;
		Object.setPrototypeOf(this, ServiceError.prototype);
	}
}
