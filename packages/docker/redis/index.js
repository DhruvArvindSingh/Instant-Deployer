import Redis from 'ioredis'

const PROJECT_ID = process.env.PROJECT_ID
const publisher = new Redis(`${process.env.REDIS_LINK}`)

export default function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}