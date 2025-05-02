import client from '../database/index.js'
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { generateSlug } from 'random-word-slugs'
import dotenv from 'dotenv'

dotenv.config()

const config = {
    CLUSTER: 'arn:aws:ecs:ap-south-1:122610522956:cluster/builder-cluster-dev',
    TASK: 'arn:aws:ecs:ap-south-1:122610522956:task-definition/builder-task'
}

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIARZDBIDNGAEUT6DMG',
        secretAccessKey: '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',
    },
});


export default async function deploy_post(req, res) {
    const { repoUrl, isStaticSite, exposePorts, customSubdomain } = req.body;
    console.log("repoUrl = ", repoUrl)
    console.log("isStaticSite = ", isStaticSite)
    console.log("exposePorts = ", exposePorts)
    console.log("customSubdomain = ", customSubdomain)
    const project = await client.query('SELECT * FROM projects WHERE github_url = $1', [repoUrl])
    if (!project.rows.length) {
        return res.status(404).json({ error: 'Project not found' })
    }
    const projectSlug = project.rows[0].subdomain;
    const projectURL = project.rows[0].custom_domain || `http://${projectSlug}.localhost:8000`
    console.log("projectURL = ", projectURL)
    const deployment = await client.query('INSERT INTO deployments (project_id, status) VALUES ($1, $2) RETURNING *', [projectId, 'QUEUED'])
    const deploymentId = deployment.rows[0].id;
    console.log("deploymentId = ", deploymentId)

    try {
        //Run container
        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: ['subnet-0ea0c3f89d5c3e88f', 'subnet-0420b94324d3d86ab', 'subnet-009c9a49cce93f951'],
                    securityGroups: ['sg-00eaec3f5b3b14bd9'],
                    assignPublicIp: 'ENABLED',
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'builder-image',
                        environment: [
                            {
                                name: 'GIT_REPOSITORY_URL',
                                value: project.rows[0].github_url
                            },
                            {
                                name: 'PROJECT_ID',
                                value: String(projectSlug)
                            },
                            {
                                name: 'DEPLOYMENT_ID',
                                value: String(deploymentId)
                            }
                        ]
                    }
                ]
            }
        });

        const response = await ecsClient.send(command);
        return res.status(200).json({
            status: 'queued',
            data: {
                projectSlug: projectSlug,
                url: projectURL
            }
        });
    } catch (error) {
        console.error("ECS Task Execution Error:", error);

        // Update deployment status to failed
        await client.query('UPDATE deployments SET status = $1 WHERE id = $2', ['FAILED', deploymentId]);

        return res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to start deployment task'
        });
    }
}