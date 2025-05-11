import client from '../database/index.js'

async function dashboard_get(req, res) {
    const user_id = req.user_id;
    const projects = await client.query('SELECT * FROM projects WHERE created_by = $1', [user_id]);
    let totalDeployments = [];
    for (const project of projects.rows) {
        const deployments = await client.query('SELECT * FROM deployments WHERE project_id = $1', [project.id]);
        totalDeployments.push(deployments.rows);
    }
    res.status(200).json({ "totalDeployments": totalDeployments, "projects": projects.rows });
}

export default dashboard_get;
