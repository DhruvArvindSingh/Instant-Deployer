
export default async function safeS3Call(s3Command, maxRetries = 3) {
    console.log("safeS3Call")
    console.log("s3Command = ", s3Command)
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await s3Command();
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (err.$metadata && err.$metadata.httpStatusCode === 500) {
                // Wait a bit before retrying
                await new Promise(res => setTimeout(res, 1000 * (i + 1)));
                continue;
            }
            throw err; // rethrow if not a 500 error
        }
    }
    throw lastError;
}

