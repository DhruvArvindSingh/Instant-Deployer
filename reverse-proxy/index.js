const express = require('express')
const client = require('./database/index.js')
const httpProxy = require('http-proxy')

const app = express()
const PORT = 8000

const BASE_PATH = 'https://vercel-bult-bucket.s3.ap-south-1.amazonaws.com/__output/'

const proxy = httpProxy.createProxy()

app.use(async (req, res) => {
    const hostname = req.hostname;
    console.log("hostname = ", hostname)
    const subdomain = hostname.split('.')[0];
    console.log("subdomain = ", subdomain)
    // Custom Domain - DB Query
    const result = await client.query('SELECT * FROM projects WHERE subdomain = $1', [subdomain])
    console.log("result = ", result)
    if (result.rows.length === 0) {
        return res.status(404).send('Not Found')
    }
    const project = result.rows[0]
    console.log("project = ", project)
    const resolvesTo = `${BASE_PATH}/${subdomain}`
    console.log("resolvesTo = ", resolvesTo)

    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true })

})

proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log("proxyReq = ", proxyReq)
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'

})

app.listen(PORT, () => console.log(`Reverse Proxy Running..${PORT}`))