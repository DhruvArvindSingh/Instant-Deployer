import { exec } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'
import publishLog from './redis/index.js'
import executeRunScript from './utils/executeRunScript.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_SCRIPT = (process.env.BUILD_SCRIPT || "npm install && npm run build");
const RUN_SCRIPT = (process.env.RUN_SCRIPT || "npm run start");



function main() {
    setTimeout(() => {
        publishLog("Ending server")
        process.exit(0);
    }, 3 * 60 * 60 * 1000)
    publishLog("Starting build")
    publishLog("Build starting ...")
    const exposePorts = process.env.EXPOSE_PORTS;
    if (exposePorts) {
        publishLog(`Exposing ports: ${exposePorts}`)
    }

    const repoUrl = process.env.GIT_REPOSITORY_URL;

    const outDir = path.join(__dirname, 'output')
    let p;

    if (fs.existsSync(path.join(outDir, 'package.json'))) {

        p = exec(`cd ${outDir} && ${BUILD_SCRIPT}`)

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
            executeRunScript(outDir)
            publishLog("Run Script completed")
        })
    } else {

        publishLog("No build script found")
        executeRunScript(outDir)
        publishLog("Run Script completed")
    }
}
main()



