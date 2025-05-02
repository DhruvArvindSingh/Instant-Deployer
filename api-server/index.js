import express from 'express'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { signup_post, signin_post, verify, project_post, deploy_post } from './controllers/index.js'
import hash_pass from './middleware/hash_pass.js'
import auth from './middleware/auth.js'
import user_id from './middleware/user_id.js'


const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())


const PORT = 9000




app.post("/signup", hash_pass, signup_post);
app.post("/signin", hash_pass, signin_post);
app.post("/verify", verify)
app.post("/project", auth, user_id, project_post)
app.post("/deploy", auth, user_id, deploy_post)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})