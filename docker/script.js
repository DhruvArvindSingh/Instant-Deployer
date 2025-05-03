import { exec } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import { S3Client } from '@aws-sdk/client-s3';
import fs from 'fs'

import publishLog from './redis/index.js'

import hasScript from './utils/hasBuildScript.js'
import uploadToS3 from './utils/uploadToS3.js'



const PROJECT_ID = process.env.PROJECT_ID


const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIARZDBIDNGAEUT6DMG',
        secretAccessKey: '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',
    },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



function main() {
    publishLog("Starting build")
    publishLog("Build starting ...")

    const repoUrl = process.env.GIT_REPOSITORY_URL;

    const outDir = path.join(__dirname, 'output')
    let p;

    if (fs.existsSync(path.join(outDir, 'package.json'))) {

        (hasScript(outDir, "build")) ? p = exec(`cd ${outDir} && npm i && npm run build`) : p = exec(`cd ${outDir} && npm i`)

        p.stdout.on('data', (data) => {
            console.log(data)
            publishLog(data.toString())
        })

        p.stdout.on('error', (data) => {
            console.log("error", data)
            publishLog(`error: ${data.toString()}`)
        })
        p.on('close', async (code) => {
            console.log("close", code)
            publishLog(`Build completed with code ${code}`)
            uploadToS3(s3Client, outDir)
            publishLog(`Uploaded all files to S3`)
        })
    } else {
        publishLog("No build script found")
        uploadToS3(s3Client, outDir)
        publishLog("Uploaded all files to S3")
    }
}
main()



