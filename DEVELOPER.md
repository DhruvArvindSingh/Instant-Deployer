# Deploy Platform - Developer Guide

This document provides comprehensive information for developers working on or extending the Deploy platform. The platform is built as a microservices architecture using a Turborepo monorepo setup.

## 🏗️ Architecture Overview

The platform consists of four main services:

### Frontend (`apps/frontend`)
- **Technology**: Next.js 13.5.1 with React 18
- **Purpose**: User interface for project management and deployment
- **Port**: 3000 (development)
- **Key Features**:
  - User authentication and dashboard
  - Project creation and management
  - Real-time deployment logs via WebSocket
  - Responsive UI with Tailwind CSS and Radix UI

### API Server (`apps/api-server`)
- **Technology**: Node.js with Express
- **Purpose**: Main backend API and deployment orchestration
- **Port**: 9000
- **Key Features**:
  - User authentication (JWT-based)
  - Project and deployment management
  - AWS ECS task orchestration
  - PostgreSQL database integration

### Socket Server (`apps/socket-server`)
- **Technology**: Node.js with Socket.IO
- **Purpose**: Real-time communication for deployment logs
- **Port**: 9002
- **Key Features**:
  - WebSocket connections for live logs
  - Redis pub/sub for log streaming
  - Real-time deployment status updates

### Reverse Proxy (`apps/reverse-proxy`)
- **Technology**: Node.js with Express and HTTP Proxy
- **Purpose**: Routes traffic to deployed applications
- **Port**: 8000
- **Key Features**:
  - Subdomain-based routing
  - Static site serving from S3
  - Dynamic application proxying
  - Custom domain support

## 🗄️ Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    github_url VARCHAR(200),
    subdomain VARCHAR(200),
    custom_domain VARCHAR(200),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Deployments table
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    status VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Log events table
CREATE TABLE log_events (
    id SERIAL PRIMARY KEY,
    deployment_id INTEGER NOT NULL,
    log VARCHAR(200),
    metadata VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
);
```

## ☁️ AWS Infrastructure

### ECS (Elastic Container Service)
The platform uses two ECS clusters for different deployment types:

#### Static Site Deployment (Cluster 1)
- **Task Definition**: `TASK1`
- **Container**: `builder-image`
- **Purpose**: Build and deploy static sites to S3
- **Lifecycle**: Temporary containers that terminate after build completion

#### Dynamic Application Deployment (Cluster 2)
- **Task Definition**: `TASK2` 
- **Container**: `dynamic-image`
- **Purpose**: Run dynamic applications
- **Lifecycle**: Long-running containers with 3-hour timeout

### S3 (Simple Storage Service)
- **Static Sites**: Stores built static assets
- **Path Structure**: `__output/{PROJECT_ID}/`
- **CDN**: Integrated with CloudFront for global distribution

### EC2 & Networking
- **Subnets**: Multi-AZ deployment across 3 subnets
- **Security Groups**: Configured for web traffic and inter-service communication
- **Public IPs**: Dynamic allocation for ECS tasks

## 🐳 Docker Containers

### Static Site Builder (`docker/`)
```dockerfile
FROM ubuntu:22.04
# Node.js 20.x installation
# Build tools and dependencies
# S3 upload utilities
```

**Key Files**:
- `main.sh`: Entry point script
- `script.js`: Build orchestration
- `utils/uploadToS3.js`: S3 deployment logic

### Dynamic Application Runner (`dynamic-docker/`)
```dockerfile
FROM ubuntu:22.04
# Node.js 20.x installation
# Runtime environment setup
# Port exposure (80-9500)
```

**Key Files**:
- `main.sh`: Entry point script
- `script.js`: Application build and run logic
- `utils/executeRunScript.js`: Runtime execution

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ (using Node.js 20.x in containers)
- pnpm package manager
- PostgreSQL database
- Redis instance
- AWS account with ECS, S3, and EC2 access

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
CLIENT_LINK=postgresql://username:password@host:port/database

# AWS Credentials
ECS_ACCESS_KEY=your_ecs_access_key
ECS_SECRET_KEY=your_ecs_secret_key
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key

# AWS Resources
CLUSTER1=static-cluster-name
CLUSTER2=dynamic-cluster-name
TASK1=static-task-definition
TASK2=dynamic-task-definition
S3_BUCKET_NAME=your-bucket-name
S3_BUCKET_FOLDER_LINK=https://your-bucket.s3.region.amazonaws.com

# Redis
REDIS_LINK=redis://localhost:6379

# API URLs
NEXT_PUBLIC_API_SERVER_URL=http://localhost:9000
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:9002
```

### Installation & Running

```bash
# Install dependencies
pnpm install

# Development mode (all services)
pnpm dev

# Production build
pnpm build

# Start production services
pnpm start

# Individual service development
cd apps/frontend && npm run dev
cd apps/api-server && npm run dev
cd apps/socket-server && npm run dev
cd apps/reverse-proxy && npm start
```

### Turborepo Configuration

The `turbo.json` defines the build pipeline:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

## 🔄 Deployment Flow

### Static Site Deployment
1. User submits GitHub repository URL
2. API server creates project and deployment records
3. ECS task is launched with static builder image
4. Container clones repository and runs build commands
5. Built assets are uploaded to S3
6. Reverse proxy serves content from S3
7. Deployment status updated to RUNNING

### Dynamic Application Deployment
1. User submits repository URL with run commands
2. API server creates project and deployment records
3. ECS task is launched with dynamic runner image
4. Container clones repository, builds, and starts application
5. Public IP is assigned and recorded
6. Reverse proxy routes traffic to container
7. Deployment status updated to RUNNING

## 📝 API Documentation

### Authentication Endpoints
```typescript
POST /signup
POST /signin
POST /verify
```

### Project Management
```typescript
GET /dashboard       // Get user dashboard data
GET /projects        // List user projects
POST /project        // Create new project
POST /deploy         // Deploy project
```

### Middleware
- `auth.js`: JWT token validation
- `hash_pass.js`: Password hashing with bcrypt
- `user_id.js`: Extract user ID from token

## 🧪 Testing

### Unit Tests
```bash
# Run tests for specific package
cd apps/api-server && npm test
cd apps/frontend && npm test
```

### Integration Tests
```bash
# Test full deployment flow
pnpm test:integration
```

### End-to-End Tests
```bash
# UI testing with Playwright/Cypress
pnpm test:e2e
```

## 🚀 Deployment & CI/CD

### Production Deployment
1. **AWS Infrastructure**: Set up ECS clusters, S3 buckets, and networking
2. **Database**: Configure PostgreSQL with required tables
3. **Redis**: Set up Redis for real-time logging
4. **Environment**: Configure all environment variables
5. **Docker Images**: Build and push container images to ECR
6. **Services**: Deploy all four services with proper networking

### CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
name: Deploy Platform CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration
- Password hashing with bcrypt
- CORS configuration for cross-origin requests
- Cookie-based authentication for frontend

### Infrastructure Security
- AWS IAM roles with minimal required permissions
- Security groups restricting network access
- HTTPS termination at load balancer
- Environment variable encryption

### Code Security
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- Rate limiting on API endpoints
- Container isolation and resource limits

## 📊 Monitoring & Logging

### Application Logs
- Structured logging with timestamps
- Real-time log streaming via Redis/Socket.IO
- Log persistence in database
- Error tracking and alerting

### Infrastructure Monitoring
- ECS task health checks
- S3 upload success/failure tracking
- Database connection monitoring
- Redis connectivity monitoring

### Performance Metrics
- Deployment success rates
- Build time tracking
- Application response times
- Resource utilization metrics

## 🛠️ Troubleshooting

### Common Development Issues

**Build Failures**
```bash
# Check Node.js version compatibility
node --version

# Clear package manager cache
pnpm store prune

# Rebuild node_modules
rm -rf node_modules && pnpm install
```

**Database Connection Issues**
```bash
# Test database connectivity
psql $CLIENT_LINK

# Check database tables
\dt
```

**Container Issues**
```bash
# View ECS logs
aws ecs describe-tasks --cluster CLUSTER_NAME --tasks TASK_ARN

# Check S3 permissions
aws s3 ls s3://bucket-name
```

### Performance Optimization

**Frontend**
- Implement code splitting and lazy loading
- Optimize bundle size with webpack analysis
- Use React.memo for component optimization
- Implement proper caching strategies

**Backend**
- Database query optimization with indexes
- Connection pooling for database
- Redis caching for frequently accessed data
- Rate limiting and request throttling

**Infrastructure**
- Auto-scaling ECS services
- CloudFront CDN configuration
- Database read replicas
- Load balancer optimization

## 🔮 Future Enhancements

### Planned Features
- [ ] Environment variable management UI
- [ ] Custom domain automation with SSL
- [ ] GitHub webhook integration
- [ ] Multi-region deployment support
- [ ] Build caching optimization
- [ ] Team collaboration features
- [ ] Resource usage analytics
- [ ] Automated rollback capabilities

### Technical Improvements
- [ ] TypeScript migration for backend services
- [ ] GraphQL API implementation
- [ ] Kubernetes deployment option
- [ ] Enhanced monitoring and alerting
- [ ] Automated testing pipeline
- [ ] Documentation site
- [ ] CLI tool for developers
- [ ] Plugin system for extensions

## 📚 Additional Resources

### Documentation
- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Socket.IO Documentation](https://socket.io/docs/)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Support
- GitHub Issues for bug reports
- Discussion forum for questions
- Email support for urgent issues

---

**Happy Building! 🚀**

*This platform is actively developed. Check the GitHub repository for the latest updates and contribution guidelines.* 