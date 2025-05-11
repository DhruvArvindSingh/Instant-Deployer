import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import safeS3Call from './safeS3.js'
import { PutObjectCommand } from '@aws-sdk/client-s3';
import publishLog from '../redis/index.js'

const PROJECT_ID = process.env.PROJECT_ID

export default async function uploadToS3(s3Client, outDir) {
    publishLog("Starting to upload ...")
    const isDist = await fs.existsSync(path.join(outDir, 'dist'));
    let files = []
    let baseDir = outDir;

    publishLog("Checking if dist exists ...")

    if (isDist) {
        console.log("dist exists")
        publishLog("dist exists")
        baseDir = path.join(outDir, 'dist');
        files = fs.readdirSync(baseDir, { recursive: true })
        console.log("allFiles = ", files)
    } else {
        console.log("dist does not exist")
        publishLog("dist does not exist")
        files = fs.readdirSync(baseDir, { recursive: true })
        console.log("allFiles = ", files)
    }


    for (const [index, file] of files.entries()) {
        const filePath = path.join(baseDir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            continue;
        }

        try {
            // Use file buffer instead of a stream
            const fileContent = fs.readFileSync(filePath);

            const command = new PutObjectCommand({
                Bucket: `${process.env.S3_BUCKET_NAME}`,
                Key: `__output/${PROJECT_ID}/${file}`,
                Body: fileContent,
                ContentType: mime.lookup(file) || 'application/octet-stream',
            })

            console.log("uploading file = ", file)
            publishLog(`uploading file = ${file}`)
            await safeS3Call(() => s3Client.send(command))
            publishLog(`✅ uploaded file = ${file}`)
            console.log("command sent")
            if (index === files.length - 1) {
                console.log("Uploaded all files to S3")
                publishLog("Uploaded all files to S3")

            }
        } catch (error) {
            console.error(`❌ ❌ Error uploading file ${file} ❌ ❌:`, error);
            publishLog(`❌Error uploading file ${file}: ${error}`)
        }

    }

    publishLog("✅ ✅ Uploading completed ✅ ✅")
}
