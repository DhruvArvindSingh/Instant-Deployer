import client from '../database/index.js'
import { z } from 'zod'

export default async function project_post(req, res) {
    console.log("project_post received")
    const schema = z.object({
        slug: z.string(),
        gitUrl: z.string(),
    })
    const safeParse = schema.safeParse(req.body)
    if (!safeParse.success) {
        return res.status(400).json({ error: safeParse.error.message })
    }

    const { gitUrl, slug } = safeParse.data
    console.log("gitUrl = ", gitUrl)
    console.log("slug = ", slug)
    console.log("req.user_id = ", req.user_id)

    const project = await client.query('INSERT INTO projects (subdomain, github_url, created_by) VALUES ($1, $2, $3) RETURNING *', [slug, gitUrl, req.user_id])
    console.log("project = ", project)
    // const deployment = await client.query('INSERT INTO deployments (project_id) VALUES ($1) RETURNING *', [project.rows[0].id])
    // console.log("deployment = ", deployment)
    return res.status(200).json({ message: 'Project created successfully', project: project.rows[0] })
}

