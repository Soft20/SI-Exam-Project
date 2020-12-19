export default class ShippingServiceError extends Error {
    constructor(message: string = "Shipping Service Error", public status: number = 500) {
        super(message);
        this.name = "ShippingServiceError";
        Object.setPrototypeOf(this, ShippingServiceError.prototype);
    }
}
