import { exec } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs'
import mime from 'mime-types'

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIARZDBIDNGAEUT6DMG',
        secretAccessKey: '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',
    },
});

const PROJECT_ID = process.env.PROJECT_ID

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function main() {

    const repoUrl = process.env.GIT_REPOSITORY_URL;

    const outDir = path.join(__dirname, 'output')
    let p;

    (hasBuildScript(outDir)) ? p = exec(`cd ${outDir} && npm i && npm run build`) : p = exec(`cd ${outDir} && npm i`)

    p.stdout.on('data', (data) => {
        console.log(data)
    })

    p.stdout.on('error', (data) => {
        console.log("error", data)
    })
    p.on('close', async (code) => {
        console.log("close", code)

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

                console.log("command = ", command)
                await safeS3Call(() => s3Client.send(command))
                console.log("command sent")
            } catch (error) {
                console.error(`Error uploading file ${file}:`, error);
            }
        }
    })
}

main()


async function hasBuildScript(repoPath) {
    try {
        console.log("repoPath = ", repoPath)
        const pkgPath = path.join(repoPath, 'package.json');
        const pkgData = fs.readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(pkgData);

        if (pkg.scripts && pkg.scripts.build) {
            console.log('✅ Build script found:', pkg.scripts.build);
            return true;
        } else {
            console.log('❌ No build script found.');
            return false;
        }
    } catch (err) {
        console.error('Error reading package.json:', err.message);
        return false;
    }
}

async function safeS3Call(s3Command, maxRetries = 3) {
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