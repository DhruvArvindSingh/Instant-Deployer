import { exec } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function main() {
    const repoUrl = process.env.GIT_REPOSITORY_URL;

    const outDir = path.join(__dirname, 'output')

    const p = exec(`cd ${outDir} && npm i && npm run start`)

    p.stdout.on('data', (data) => {
        console.log(data)
    })

    p.stdout.on('error', (data) => {
        console.error(data)
    })

}

main()