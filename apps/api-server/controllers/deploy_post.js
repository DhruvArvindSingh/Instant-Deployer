import client from '../database/index.js'
import { ECSClient, RunTaskCommand, DescribeTasksCommand } from "@aws-sdk/client-ecs"
import { generateSlug } from 'random-word-slugs'
import dotenv from 'dotenv'
import { DescribeNetworkInterfacesCommand, EC2Client } from "@aws-sdk/client-ec2"
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../../.env' });

const config = {
    CLUSTER1: process.env.CLUSTER1,
    CLUSTER2: process.env.CLUSTER2,
    TASK1: process.env.TASK1,
    TASK2: process.env.TASK2
}

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.ECS_ACCESS_KEY,
        secretAccessKey: process.env.ECS_SECRET_KEY,
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
                cluster: config.CLUSTER1,
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
                                    name: 'BUILD_COMMANDS',
                                    value: buildCommands
                                }
                            ]
                        }
                    ]
                }
            });
            const response = await ecsClient.send(command);
            await new Promise(resolve => setTimeout(resolve, 5000));

            return res.status(200).json({
                status: 'running',
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
        const ec2Client = new EC2Client({ region: "ap-south-1" });
        const allExposePorts = ['/app/main.sh', '--'];
        if (exposePorts) {
            console.log("exposePorts = ", exposePorts)
        }
        console.log("Running container for dynamic site")
        //Run container
        const command = new RunTaskCommand({
            cluster: config.CLUSTER2,
            taskDefinition: config.TASK2,
            launchType: 'FARGATE',
            count: 1,
            portMappings: [
                allExposePorts.map(port => ({
                    containerPort: port,
                    hostPort: port,
                    protocol: 'tcp'
                }))
            ],
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: ['subnet-0ea0c3f89d5c3e88f', 'subnet-0420b94324d3d86ab', 'subnet-009c9a49cce93f951'],
                    securityGroups: ['sg-020a67718eac8ed9c'],
                    assignPublicIp: 'ENABLED',
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'dynamic-image',
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
                        ],
                        command: allExposePorts
                    }
                ]
            }
        });
        const response = await ecsClient.send(command);

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("response = ", response)
        const taskArn = response.tasks[0].taskArn;
        console.log("taskArn = ", taskArn)
        const describeTask = await ecsClient.send(new DescribeTasksCommand({
            cluster: config.CLUSTER2,
            tasks: [taskArn]
        }));
        console.log("describeTask = ", describeTask)
        const eniAttachment = describeTask.tasks[0].attachments[0].details.find(detail => detail.name === 'networkInterfaceId');
        console.log("describeTask.tasks[0].attachments[0] = ", describeTask.tasks[0].attachments[0])
        console.log("eniAttachment = ", eniAttachment)
        const eniId = eniAttachment.value;
        console.log("eniId = ", eniId)
        let publicIp = null;
        let eni = null;
        const maxRetries = 10;
        const delayMs = 2000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const describeEni = await ec2Client.send(new DescribeNetworkInterfacesCommand({
                NetworkInterfaceIds: [eniId]
            }));
            console.log(`describeEni attempt ${attempt} = `, describeEni);
            eni = describeEni.NetworkInterfaces[0];
            publicIp = eni.Association ? eni.Association.PublicIp : null;
            if (publicIp) break;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        if (!publicIp) {
            console.error("No public IP assigned to the ENI after retries:", eni);
            return res.status(500).json({
                status: 'failed',
                error: 'No public IP assigned to the ENI after multiple retries. Please try again later.'
            });
        }
        console.log("publicIp = ", publicIp)
        const projectURL = `http://${publicIp}`;
        console.log("projectURL = ", projectURL)
        await client.query('UPDATE deployments SET status = $1 WHERE id = $2', ['RUNNING', deploymentId]);
        await client.query('UPDATE projects SET custom_domain = $1 WHERE id = $2', [projectURL, projectId]);
        return res.status(200).json({
            status: 'running',
            data: {
                projectSlug: projectSlug,
                url: projectURL
            }
        });
    }
}