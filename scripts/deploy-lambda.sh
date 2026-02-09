#!/bin/bash

# BTD Fraud Detector - AWS Lambda Deployment Script
# This script builds and deploys the application to AWS Lambda

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${PROJECT_NAME:-btd-fraud-detector}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BTD Fraud Detector - Lambda Deployment   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Validate required environment variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo -e "${RED}Error: AWS_ACCOUNT_ID environment variable is not set${NC}"
  echo "Please set it using: export AWS_ACCOUNT_ID=your_account_id"
  exit 1
fi

# Validate AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not installed${NC}"
  echo "Please install it from: https://aws.amazon.com/cli/"
  exit 1
fi

# Validate Docker is installed and running
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed${NC}"
  echo "Please install it from: https://www.docker.com/"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}Error: Docker is not running${NC}"
  echo "Please start Docker Desktop"
  exit 1
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project Name: $PROJECT_NAME"
echo "  AWS Region: $AWS_REGION"
echo "  AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# Step 1: Build Docker image
echo -e "${BLUE}[1/6] Building Docker image...${NC}"
docker build -t "$PROJECT_NAME" .
echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

# Step 2: Create ECR repository (if it doesn't exist)
echo -e "${BLUE}[2/6] Creating ECR repository...${NC}"
if aws ecr describe-repositories --repository-names "$PROJECT_NAME" --region "$AWS_REGION" &> /dev/null; then
  echo -e "${YELLOW}Repository already exists, skipping creation${NC}"
else
  aws ecr create-repository \
    --repository-name "$PROJECT_NAME" \
    --region "$AWS_REGION" \
    --image-scanning-configuration scanOnPush=true
  echo -e "${GREEN}✓ ECR repository created${NC}"
fi
echo ""

# Step 3: Authenticate Docker to ECR
echo -e "${BLUE}[3/6] Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo -e "${GREEN}✓ Docker authenticated${NC}"
echo ""

# Step 4: Tag Docker image
echo -e "${BLUE}[4/6] Tagging Docker image...${NC}"
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME"
docker tag "$PROJECT_NAME:latest" "$ECR_URI:latest"
echo -e "${GREEN}✓ Image tagged${NC}"
echo ""

# Step 5: Push to ECR
echo -e "${BLUE}[5/6] Pushing image to ECR...${NC}"
docker push "$ECR_URI:latest"
echo -e "${GREEN}✓ Image pushed to ECR${NC}"
echo ""

# Step 6: Update or create Lambda function
echo -e "${BLUE}[6/6] Deploying to Lambda...${NC}"
LAMBDA_FUNCTION_NAME="$PROJECT_NAME"

# Check if function exists
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --image-uri "$ECR_URI:latest" \
    --region "$AWS_REGION"

  echo -e "${GREEN}✓ Lambda function updated${NC}"
else
  echo -e "${YELLOW}Lambda function doesn't exist.${NC}"
  echo "Please create it manually in the AWS Console with the following settings:"
  echo "  - Function name: $LAMBDA_FUNCTION_NAME"
  echo "  - Image URI: $ECR_URI:latest"
  echo "  - Memory: 512 MB"
  echo "  - Timeout: 30 seconds"
  echo "  - Environment variables:"
  echo "    - ANTHROPIC_API_KEY or OPENAI_API_KEY"
  echo "    - BRAINTRUST_API_KEY"
  echo "    - ESCALATION_EMAIL"
  echo ""
  echo "Or use the AWS CLI:"
  echo "  aws lambda create-function \\"
  echo "    --function-name $LAMBDA_FUNCTION_NAME \\"
  echo "    --package-type Image \\"
  echo "    --code ImageUri=$ECR_URI:latest \\"
  echo "    --role arn:aws:iam::$AWS_ACCOUNT_ID:role/lambda-execution-role \\"
  echo "    --memory-size 512 \\"
  echo "    --timeout 30 \\"
  echo "    --region $AWS_REGION"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure your Lambda function in AWS Console"
echo "  2. Set up Function URL or API Gateway"
echo "  3. Add environment variables (API keys)"
echo "  4. Test the deployment"
echo ""
echo "Image URI: $ECR_URI:latest"
