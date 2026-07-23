
# EC2 Deployment Guide — Project Tracker Application

## Prerequisites

- AWS Account with EC2 access
- SSH key pair created in AWS Console
- Basic familiarity with Linux terminal

---

## Step 1: Launch an EC2 Instance

### Recommended Specs

| Setting | Recommended Value |
|---------|------------------|
| AMI | Amazon Linux 2023 or Ubuntu 22.04 LTS |
| Instance Type | t3.small (2 vCPU, 2 GB RAM) minimum |
| Storage | 20 GB gp3 SSD |
| Key Pair | Your existing or new key pair |

### Security Group Rules (Inbound)

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | Frontend (HTTP) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (future) |
| 8000 | TCP | 0.0.0.0/0 | Backend API |

### Launch Steps

1. Go to **AWS Console → EC2 → Launch Instance**
2. Name: `project-tracker-server`
3. Select AMI: **Amazon Linux 2023** (free tier eligible)
4. Instance type: **t3.small**
5. Select your key pair
6. Configure security group with rules above
7. Set storage to **20 GB gp3**
8. Click **Launch Instance**

---

## Step 2: Connect to Your Instance

```bash
# Replace with your key file and public IP
ssh -i "your-key.pem" ec2-user@<YOUR_EC2_PUBLIC_IP>

# For Ubuntu AMI, use:
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## Step 3: Install Docker & Docker Compose

### Amazon Linux 2023

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker git

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (avoids sudo for docker commands)
sudo usermod -aG docker $USER

# Install Docker Compose
DOCKER_COMPOSE_VERSION="v2.24.5"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Apply group changes (or logout and login again)
newgrp docker
```

### Ubuntu 22.04

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## Step 4: Clone Your Repository

```bash
# Clone the project
cd /opt
sudo git clone https://github.com/zmarzon1102/project-tracker.git
sudo chown -R $USER:$USER /opt/project-tracker
cd /opt/project-tracker
```

---

## Step 5: Configure Environment Variables

```bash
# Create .env file from template
cp .env.example .env
nano .env
```

### Production `.env` Configuration

```env
# Database (use strong credentials!)
POSTGRES_USER=project_tracker
POSTGRES_PASSWORD=YourStr0ng!P@ssw0rd#2026
POSTGRES_DB=project_tracker_db
DATABASE_URL=postgresql://project_tracker:YourStr0ng!P@ssw0rd#2026@db:5432/project_tracker_db

# Backend Security
SECRET_KEY=generate_a_64_char_random_string_use_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend - Replace with your actual EC2 public IP or domain
VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000
```

### Generate a Secure SECRET_KEY

```bash
# Run this command to generate a random secret key
openssl rand -hex 32
# Copy the output and paste it as your SECRET_KEY value
```

---

## Step 6: Build and Start the Application

```bash
cd /opt/project-tracker

# Build all containers (first time takes 3-5 minutes)
docker-compose up -d --build

# Verify all 3 containers are running
docker-compose ps
```

Expected output:
```
NAME                    STATUS    PORTS
project-tracker-db      Up        5432/tcp
project-tracker-backend Up        0.0.0.0:8000->8000/tcp
project-tracker-frontend Up       0.0.0.0:80->80/tcp
```

---

## Step 7: Run Database Migrations

```bash
# Wait 10 seconds for PostgreSQL to fully initialize
sleep 10

# Run Alembic migrations
docker-compose exec backend alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial_schema, Initial schema creation.
```

---

## Step 8: Verify the Deployment

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | `http://<YOUR_EC2_PUBLIC_IP>` | Login page |
| Backend API | `http://<YOUR_EC2_PUBLIC_IP>:8000` | JSON response |
| Swagger Docs | `http://<YOUR_EC2_PUBLIC_IP>:8000/docs` | Interactive API docs |
| Health Check | `http://<YOUR_EC2_PUBLIC_IP>:8000/health` | `{"status": "healthy"}` |

---

## Step 9: Create Your First User

1. Open `http://<YOUR_EC2_PUBLIC_IP>` in your browser
2. Click **Register**
3. Fill in username, email, and password
4. You'll be automatically logged in

---

## Operational Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
docker-compose down
```

### Rebuild After Code Changes

```bash
cd /opt/project-tracker
git pull
docker-compose up -d --build
```

### Access Database Directly

```bash
docker-compose exec db psql -U project_tracker -d project_tracker_db
```

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U project_tracker project_tracker_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
cat backup_file.sql | docker-compose exec -T db psql -U project_tracker -d project_tracker_db
```

---

## Automatic Startup on Reboot

Docker is already enabled to start on boot (`systemctl enable docker`). To ensure containers auto-restart:

```bash
# Verify restart policy in docker-compose.yml (already set to "unless-stopped")
docker-compose up -d
```

---

## Adding SSL/HTTPS (Recommended for Production)

### Option A: Using Certbot (Free SSL via Let's Encrypt)

```bash
# Install certbot
sudo yum install -y certbot  # Amazon Linux
# OR
sudo apt install -y certbot  # Ubuntu

# Obtain certificate (requires a domain name pointing to your EC2 IP)
sudo certbot certonly --standalone -d yourdomain.com

# Certificate files will be at:
#   /etc/letsencrypt/live/yourdomain.com/fullchain.pem
#   /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Then update `nginx.conf` to add SSL server block:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of your nginx config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Option B: AWS Application Load Balancer (ALB)

1. Request a free SSL certificate in **AWS Certificate Manager**
2. Create an ALB with HTTPS listener (port 443)
3. Point ALB to your EC2 instance on port 80
4. Update your domain DNS to point to the ALB

---

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs db

# Common fix: recreate containers
docker-compose down
docker-compose up -d --build
```

### Database connection refused

```bash
# Ensure DB container is healthy
docker-compose ps db

# Wait for it to initialize, then retry migrations
sleep 15
docker-compose exec backend alembic upgrade head
```

### Frontend shows blank page

```bash
# Verify VITE_API_URL is set correctly in .env
# It must match your EC2 public IP
cat .env | grep VITE_API_URL

# Rebuild frontend after changing .env
docker-compose up -d --build frontend
```

### Port already in use

```bash
# Find what's using port 80 or 8000
sudo lsof -i :80
sudo lsof -i :8000

# Kill the process or stop the conflicting service
sudo kill -9 <PID>
```

### Out of disk space

```bash
# Clean unused Docker resources
docker system prune -af
docker volume prune -f
```

---

## Security Hardening Checklist

- [ ] Change default database password to a strong, unique value
- [ ] Generate a random SECRET_KEY using `openssl rand -hex 32`
- [ ] Restrict SSH access to your IP only in security group
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up automated database backups
- [ ] Enable CloudWatch monitoring for the EC2 instance
- [ ] Keep Docker images updated regularly
- [ ] Consider using AWS Secrets Manager for credentials
- [ ] Enable fail2ban for SSH brute-force protection
- [ ] Set up log rotation for Docker logs

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 EC2 Instance                     │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Frontend │  │ Backend  │  │  PostgreSQL  │  │
│  │ (Nginx)  │  │ (FastAPI)│  │   Database   │  │
│  │ Port: 80 │  │Port: 8000│  │  Port: 5432  │  │
│  └─────┬────┘  └────┬─────┘  └──────┬───────┘  │
│        │             │               │          │
│        └─────────────┴───────────────┘          │
│              Docker Compose Network             │
└─────────────────────────────────────────────────┘
```
