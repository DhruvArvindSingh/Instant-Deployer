import client from '../database/index.js'
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { generateSlug } from 'random-word-slugs'
import dotenv from 'dotenv'

dotenv.config()

const config = {
    CLUSTER: 'arn:aws:ecs:ap-south-1:122610522956:cluster/builder-cluster-dev',
    TASK1: 'arn:aws:ecs:ap-south-1:122610522956:task-definition/builder-task',
    TASK2: 'arn:aws:ecs:ap-south-1:122610522956:task-definition/builder-task-2'
}

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIARZDBIDNGAEUT6DMG',
        secretAccessKey: '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',
    },
});


export default async function deploy_post(req, res) {
    let { repoUrl, isStaticSite, exposePorts, customSubdomain, buildCommands, runCommands } = req.body;
    console.log("\n\ndeploy_post called")
    console.log("repoUrl = ", repoUrl)
    console.log("isStaticSite = ", isStaticSite)
    console.log("exposePorts = ", exposePorts)
    console.log("customSubdomain = ", customSubdomain)

    // console.log("buildCommands = ", buildCommands)
    // console.log("runCommands = ", runCommands)

    runCommands = runCommands.join('&&')
    buildCommands = buildCommands.join('&&')
    console.log("runCommands = ", runCommands)
    console.log("buildCommands = ", buildCommands)

    let subDomain = '';
    if (customSubdomain == '') {
        subDomain = generateSlug()
    }
    let project = {};
    try {
        project = await client.query(`INSERT INTO projects (github_url, subdomain, created_by) VALUES ($1, $2, $3) RETURNING *`, [repoUrl, subDomain, req.user_id])
    } catch (error) {
        console.error("Error creating project", error)
        return res.status(500).json({ error: 'Failed to create project' })
    }
    const projectId = project.rows[0].id;
    console.log("\nproject created with projectId = ", projectId)
    const projectSlug = project.rows[0].subdomain;
    const projectURL = project.rows[0].custom_domain || `http://${projectSlug}.localhost:8000`
    console.log("projectURL = ", projectURL)
    const deployment = await client.query('INSERT INTO deployments (project_id, status) VALUES ($1, $2) RETURNING *', [projectId, 'QUEUED'])
    const deploymentId = deployment.rows[0].id;
    console.log("deploymentId = ", deploymentId)
    if (isStaticSite) {
        console.log("Running container for static site")
        try {
            //Run container
            const command = new RunTaskCommand({
                cluster: config.CLUSTER,
                taskDefinition: config.TASK1,
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
                                },
                                {
                                    name: 'RUN_COMMANDS',
                                    value: runCommands
                                },
                                {
                                    name: 'BUILD_COMMANDS',
                                    value: buildCommands
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
    else {
        const allExposePorts = ['/app/main.sh', '--'];
        if (exposePorts) {
            allExposePorts.push('--')
            exposePorts?.forEach(port => {
                allExposePorts.push('--expose', `${port}`)
            })
            console.log("allExposePorts = ", allExposePorts)
        }
        console.log("Running container for dynamic site")
        //Run container
        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK2,
            launchType: 'EC2',
            count: 1,
            portMappings: [
                {
                    containerPort: 80,
                    hostPort: 80,
                    protocol: 'tcp'
                }
            ],
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
                            },
                            {
                                name: 'EXPOSE_PORTS',
                                value: exposePorts || ''
                            },
                            {
                                name: 'RUN_COMMANDS',
                                value: runCommands
                            },
                            {
                                name: 'BUILD_COMMANDS',
                                value: buildCommands
                            }
                        ],
                        command: allExposePorts
                    }
                ]
            }
        });
    }
    const response = await ecsClient.send(command);
}