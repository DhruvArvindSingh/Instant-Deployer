import pkg from "pg";
import path from 'path';
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: '../../.env' });

const { CLIENT_LINK } = process.env;
const { Client } = pkg;
let client;
try {
        client = await new Client(`${CLIENT_LINK}`);
}
catch (e) {
        console.log("Unable to connect to database");
        console.log(e);
}
await client.connect();
await client.query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY, 
    name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);
await client.query(`CREATE TABLE IF NOT EXISTS projects(
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    github_url VARCHAR(200),
    subdomain VARCHAR(200),
    custom_domain VARCHAR(200),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )`);
await client.query(`CREATE TABLE IF NOT EXISTS deployments(
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        status VARCHAR(200),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE        
)`);
await client.query(`CREATE TABLE IF NOT EXISTS log_events(
        id SERIAL PRIMARY KEY,
        deployment_id INTEGER NOT NULL,
        log VARCHAR(200),
        metadata VARCHAR(1000),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
)`);

export default client;