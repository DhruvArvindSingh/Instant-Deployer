import express from 'express'
import client from './database/index.js'
import httpProxy from 'http-proxy'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config({ path: '../../.env' });

const app = express()
app.use(cors())
const PORT = 8000

const BASE_PATH = `${process.env.S3_BUCKET_FOLDER_LINK}`

const proxy = httpProxy.createProxy()

app.use(async (req, res) => {
    try {
        const hostname = req.hostname;
        console.log("hostname = ", hostname)
        const subdomain = hostname.split('.')[0];
        console.log("subdomain = ", subdomain)

        // Custom Domain - DB Query
        try {
            const result = await client.query('SELECT * FROM projects WHERE subdomain = $1', [subdomain])
            console.log("result = ", result)
            if (result.rows.length === 0) {
                return res.status(404).send('Project Not Found')
            }
            const project = result.rows[0]
            console.log("project = ", project)
            const resolvesTo = `${BASE_PATH}/${subdomain}`
            console.log("resolvesTo = ", resolvesTo)

            return proxy.web(req, res, { target: resolvesTo, changeOrigin: true })
        } catch (dbError) {
            console.error("Database query error:", dbError)
            return res.status(500).send('Database error')
        }
    } catch (error) {
        console.error("Request handling error:", error)
        return res.status(500).send('Server error')
    }
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log("proxyReq = ", proxyReq)
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'
})

proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
        res.status(500).send('Proxy error');
    }
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`))