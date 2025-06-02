import publishLog from '../redis/index.js'
import { exec } from 'child_process'

const RUN_SCRIPT = (process.env.RUN_SCRIPT || "npm run start");

export default function executeRunScript(outDir) {
    publishLog("Running Run Script")
    const k = exec(`cd ${outDir} && ${RUN_SCRIPT}`)
    k.stdout.on('data', (data) => {
        console.log(data)
        publishLog(data.toString())
    })
    k.stdout.on('error', (data) => {
        console.log("error", data)
        publishLog(`error: ${data.toString()}`)
    })
    k.on('close', (code) => {
        console.log("close", code)
        publishLog(`Run Script completed with code ${code}`)
    })
}