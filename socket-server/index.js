import { Server } from 'socket.io'
import Redis from 'ioredis'

const subscriber = new Redis('rediss://default:AVNS_XpU40UIE-G0XiRF5Qu1@my-vercel-redis-my-vercel-redis.l.aivencloud.com:14820')

const io = new Server({ cors: '*' })

subscriber.subscribe('logs:*', (err) => {
    if (err) {
        console.error('Failed to subscribe:', err)
        return
    }
})


io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('subscribe', (channel) => {
        console.log('subscribed to channel', channel)
        socket.join(channel)
        socket.emit('message', `Joined channel: ${channel}`)
    })
})


async function initRedisSubscribe() {
    console.log('Initializing Redis subscribe')
    subscriber.psubscribe('logs:*');
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message)
    })
}

initRedisSubscribe()

io.listen(9001, () => {
    console.log('Socket server is running on port 9001')
})