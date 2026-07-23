
#!/bin/bash
# =============================================================
# EC2 Deployment Script for Project Tracker Application
# Compatible with: Amazon Linux 2023 / Ubuntu 22.04
# =============================================================

set -e

echo "================================================"
echo "  Project Tracker - EC2 Setup Script"
echo "================================================"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

echo "[1/6] Installing Docker..."
if [ "$OS" == "amzn" ]; then
    sudo yum update -y
    sudo yum install -y docker git
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
elif [ "$OS" == "ubuntu" ]; then
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

echo "[2/6] Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="v2.24.5"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "[3/6] Cloning repository..."
if [ -d "/opt/project-tracker" ]; then
    cd /opt/project-tracker
    git pull
else
    sudo git clone https://github.com/zmarzon1102/project-tracker.git /opt/
