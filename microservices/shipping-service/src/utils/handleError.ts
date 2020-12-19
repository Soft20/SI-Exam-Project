import { Response } from "express"

export default function handleError(err: any, res: Response) {
    console.error('ErrorMessage:\n', err)
    const status: number = err.status || 500
    const message: String = err.message || "Something went wrong!"

    const responseError: object = {
        message
    }

    res.status(status)
    res.send(responseError)
} 