import Redis from 'ioredis'

const PROJECT_ID = process.env.PROJECT_ID
const publisher = new Redis('rediss://default:AVNS_XpU40UIE-G0XiRF5Qu1@my-vercel-redis-my-vercel-redis.l.aivencloud.com:14820')

export default function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}