import client from '../database/index.js'


export default async function projects_get(req, res) {
    console.log("projects_get received")
    const projects = await client.query("SELECT * FROM projects WHERE created_by = $1", [req.user_id])
    res.status(200).json(projects.rows)
}