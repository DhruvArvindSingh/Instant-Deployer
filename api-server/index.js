const express = require('express')
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs")

const app = express()

app.use(express.json())


const PORT = 9000

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

app.post("/project", async (req, res) => {
    const { projectURL } = req.body;
    const projectSlug = generateSlug();


    //Run conatiner\
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
                            value: projectURL
                        },
                        {
                            name: 'PROJECT_ID',
                            value: projectSlug
                        }
                    ]
                }
            ]
        }
    })

    const response = await ecsClient.send(command)
    return res.status(200).json({
        status: 'queued',
        data: {
            projectSlug: projectSlug,
            url: `http://${projectSlug}.localhost:8000`
        }
    })

})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})