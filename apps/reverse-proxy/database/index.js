import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: '../../.env' });

const { Client } = pkg;
const client = new Client(`${process.env.CLIENT_LINK}`);

// Initialize database connection
async function initializeDatabase() {
        try {
                await client.connect();
                console.log("Connected to database successfully");

                // Create tables if they don't exist
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

                console.log("Database tables initialized");
        } catch (error) {
                console.error("Database initialization error:", error);
        }
}

// Start the initialization process without blocking
initializeDatabase();

export default client;