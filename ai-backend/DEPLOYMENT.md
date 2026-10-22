# Production deployment guide for WorkSpace AI Backend

This guide covers production deployment strategies and best practices.

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)

#### Quick Start
```bash
# Clone and navigate to project
cd ai-backend

# Build and start services
docker-compose up -d

# Check health
curl http://localhost:8000/health
```

#### Production Docker Compose
```bash
# Start with monitoring stack
docker-compose --profile monitoring up -d

# View logs
docker-compose logs -f backend

# Scale backend
docker-compose up -d --scale backend=3
```

### 2. Manual Deployment

#### Prerequisites
- Python 3.11+
- MongoDB 5.0+
- Redis (optional, for caching)

#### Deployment Steps
```bash
# 1. Run deployment script
python deploy.py

# 2. Start application
python app/main.py

# 3. Verify deployment
curl http://localhost:8000/health
```

## 🔧 Configuration

### Environment Variables

#### Required for Production
```bash
# Database
MONGODB_URL=mongodb://username:password@host:port/database
MONGODB_DB_NAME=workspace_ai

# Security
DEBUG=false
ENABLE_AUTH=true
CLERK_JWKS_URL=https://your-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_JWT_AUDIENCE=your-audience
CLERK_JWT_ISSUER=https://your-domain.clerk.accounts.dev

# CORS
FRONTEND_URL=https://your-app.vercel.app
FRONTEND_VERCEL_URL=https://your-app.vercel.app
```

#### Optional Enhancements
```bash
# Performance
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100
ENABLE_METRICS=true

# Logging
LOG_LEVEL=INFO
ENABLE_REQUEST_LOGGING=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🔒 Security Considerations

### Authentication
- Configure Clerk JWT properly
- Use HTTPS in production
- Rotate JWT secrets regularly

### Network Security
- Use firewall rules
- Enable rate limiting
- Monitor for abuse

### Data Protection
- Encrypt database connections
- Use environment variables for secrets
- Regular security updates

## 📊 Monitoring

### Health Checks
```bash
# Basic health
curl http://localhost:8000/health

# Detailed health with database
curl http://localhost:8000/health/detailed

# Metrics health
curl http://localhost:8000/metrics/health
```

### Metrics Collection
```bash
# Application metrics (requires auth)
curl -H "Authorization: Bearer <token>" http://localhost:8000/metrics

# Prometheus format
curl -H "Authorization: Bearer <token>" http://localhost:8000/metrics/prometheus
```

### Log Monitoring
```bash
# View application logs
docker-compose logs -f backend

# View specific service logs
docker-compose logs -f mongodb
```

## 🚀 Scaling Strategies

### Horizontal Scaling
```bash
# Docker Compose scaling
docker-compose up -d --scale backend=3

# Kubernetes deployment
kubectl apply -f k8s/
```

### Load Balancing
- Use nginx or cloud load balancer
- Configure health checks
- Implement session affinity if needed

### Database Scaling
- MongoDB replica sets
- Read replicas for read-heavy workloads
- Connection pooling

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy WorkSpace Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker-compose up -d --build
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test connection
python -c "
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient('mongodb://localhost:27017')
print(client.admin.command('ping'))
"
```

#### Authentication Issues
```bash
# Verify Clerk configuration
curl -H "Authorization: Bearer <token>" http://localhost:8000/health

# Check JWKS endpoint
curl https://your-domain.clerk.accounts.dev/.well-known/jwks.json
```

#### Performance Issues
```bash
# Check metrics
curl -H "Authorization: Bearer <token>" http://localhost:8000/metrics

# Monitor response times
curl -w "@curl-format.txt" http://localhost:8000/health
```

## 📈 Performance Optimization

### Database Optimization
- Create proper indexes
- Use connection pooling
- Monitor slow queries

### Caching Strategy
- Enable Redis for distributed caching
- Cache analysis results
- Use CDN for static assets

### Application Optimization
- Enable rate limiting
- Use async operations
- Monitor memory usage

## 🔧 Maintenance

### Regular Tasks
- Update dependencies
- Rotate secrets
- Backup database
- Monitor logs

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/

# Application backup
tar -czf workspace-backup-$(date +%Y%m%d).tar.gz .
```

### Updates
```bash
# Update dependencies
pip install --upgrade -r requirements.txt

# Rebuild Docker image
docker-compose build --no-cache backend

# Restart services
docker-compose up -d
```

## 🌐 Production Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Authentication working
- [ ] CORS settings correct
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health checks passing

### Post-deployment
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup schedule set
- [ ] SSL certificates valid
- [ ] Performance baseline established
- [ ] Documentation updated

### Security Review
- [ ] Secrets managed properly
- [ ] Network security configured
- [ ] Access controls in place
- [ ] Audit logging enabled
- [ ] Security updates applied

## 🆘 Support

### Getting Help
- Check application logs
- Review metrics dashboard
- Consult API documentation
- Check GitHub issues

### Emergency Procedures
1. Check health endpoints
2. Review recent deployments
3. Check database connectivity
4. Monitor system resources
5. Review error logs

---

For additional support, refer to the main README.md or create an issue in the repository.
