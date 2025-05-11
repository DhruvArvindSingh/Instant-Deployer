import { Server } from 'socket.io'
import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' });
console.log("process.env.REDIS_LINK = ", process.env.REDIS_LINK);
const subscriber = new Redis(`${process.env.REDIS_LINK}`);

// const subscriber = new Redis(`${process.env.REDIS_LINK}`)

const io = new Server({
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

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
        console.log("pattern", pattern);
        console.log("channel", channel);
        console.log("message", message);
        io.to(channel).emit('message', message)
    })
}

initRedisSubscribe()

io.listen(9001, () => {
    console.log('Socket server is running on port 9001')
})