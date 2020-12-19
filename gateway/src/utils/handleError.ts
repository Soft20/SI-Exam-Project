export default function handleError(err, res) {
    const status: number = err.status || 500
    const message: String = err.message || "Something went wrong!"

    const responseError: object = {
        message
    }

    res.status(status)
    res.send(responseError)
} 