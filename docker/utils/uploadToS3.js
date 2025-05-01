import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import safeS3Call from './safeS3.js'
import { PutObjectCommand } from '@aws-sdk/client-s3';

const PROJECT_ID = process.env.PROJECT_ID

export default async function uploadToS3(s3Client, outDir) {
    const isDist = await fs.existsSync(path.join(outDir, 'dist'));
    let files = []
    let baseDir = outDir;

    if (isDist) {
        console.log("dist exists")
        baseDir = path.join(outDir, 'dist');
        files = fs.readdirSync(baseDir, { recursive: true })
        console.log("allFiles = ", files)
    } else {
        console.log("dist does not exist")
        files = fs.readdirSync(baseDir, { recursive: true })
        console.log("allFiles = ", files)
    }

    for (const file of files) {
        const filePath = path.join(baseDir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            continue;
        }

        console.log("uploading file = ", file)

        try {
            // Use file buffer instead of a stream
            const fileContent = fs.readFileSync(filePath);

            const command = new PutObjectCommand({
                Bucket: 'vercel-bult-bucket',
                Key: `__output/${PROJECT_ID}/${file}`,
                Body: fileContent,
                ContentType: mime.lookup(file) || 'application/octet-stream',
            })

            console.log("uploading file = ", file)
            await safeS3Call(() => s3Client.send(command))
            console.log("command sent")
        } catch (error) {
            console.error(`Error uploading file ${file}:`, error);
        }
    }
}
