const { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectsCommand 
} = require('@aws-sdk/client-s3');
const { 
  EC2Client, 
  RunInstancesCommand, 
  StopInstancesCommand, 
  RebootInstancesCommand, 
  TerminateInstancesCommand,
  DescribeInstancesCommand,
  DescribeInstanceStatusCommand,
  waitUntilInstanceRunning,
  waitUntilInstanceStopped,
  waitUntilInstanceTerminated
} = require('@aws-sdk/client-ec2');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// Configure AWS region
const region = process.env.AWS_REGION || 'us-west-2';

// Initialize AWS clients
const s3Client = new S3Client({ 
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const ec2Client = new EC2Client({ 
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload project archive to S3
const uploadToS3 = async (filePath, deploymentId) => {
  try {
    const fileContent = await readFileAsync(filePath);
    const bucketName = process.env.S3_BUCKET_NAME;
    const key = `deployments/${deploymentId}/project.zip`;
    
    // Create multipart upload using Upload utility
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: fileContent
      }
    });
    
    await upload.done();
    
    return {
      bucket: bucketName,
      key: key
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Delete project files from S3
const deleteFromS3 = async (deploymentId) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const prefix = `deployments/${deploymentId}/`;
    
    // List objects with the deployment prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    });
    
    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) return;
    
    // Delete all objects with the deployment prefix
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: Contents.map(obj => ({ Key: obj.Key }))
      }
    });
    
    await s3Client.send(deleteCommand);
    
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

// Launch a new EC2 instance for deployment
const startInstance = async (deploymentId, deployment) => {
  try {
    // Prepare user data script to bootstrap the instance
    // This script will:
    // 1. Install Docker and Docker Compose
    // 2. Download the project archive from S3
    // 3. Extract and run the project
    const userData = `#!/bin/bash
# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y awscli unzip docker.io

# Start Docker service
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker debian

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/cloudautodeploy/${deploymentId}
cd /opt/cloudautodeploy/${deploymentId}

# Download project archive from S3
aws s3 cp s3://${process.env.S3_BUCKET_NAME}/deployments/${deploymentId}/project.zip ./project.zip
unzip project.zip
rm project.zip

# Set environment variables
${Object.entries(deployment.envVars || {})
  .map(([key, value]) => `echo "export ${key}=${value}" >> /etc/environment`)
  .join('\n')}

# Detect project type and run
if [ -f "docker-compose.yml" ]; then
  # Docker Compose project
  docker-compose up -d
elif [ -f "Dockerfile" ]; then
  # Docker project
  docker build -t ${deploymentId} .
  docker run -d -p 80:80 --name ${deploymentId} ${deploymentId}
else
  echo "No Dockerfile or docker-compose.yml found. Exiting."
  exit 1
fi

# Setup logging
docker logs -f ${deploymentId} > /var/log/app.log 2>&1 &
`;

    // Launch the EC2 instance
    const runInstancesCommand = new RunInstancesCommand({
      ImageId: process.env.EC2_AMI_ID || 'ami-0261755bbcb8c4a84', // Ubuntu 20.04 LTS
      InstanceType: process.env.EC2_INSTANCE_TYPE || 't2.micro',
      MinCount: 1,
      MaxCount: 1,
      KeyName: process.env.EC2_KEY_PAIR_NAME,
      SecurityGroupIds: [process.env.EC2_SECURITY_GROUP_ID],
      SubnetId: process.env.EC2_SUBNET_ID,
      UserData: Buffer.from(userData).toString('base64'),
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            {
              Key: 'Name',
              Value: `CloudAutoDeploy-${deploymentId}`
            },
            {
              Key: 'DeploymentId',
              Value: deploymentId
            }
          ]
        }
      ]
    });
    
    const result = await ec2Client.send(runInstancesCommand);
    const instanceId = result.Instances[0].InstanceId;
    
    // Wait for instance to be running
    await waitUntilInstanceRunning(
      { client: ec2Client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] }
    );
    
    // Get instance details
    const describeInstancesCommand = new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    const instanceInfo = await ec2Client.send(describeInstancesCommand);
    const instance = instanceInfo.Reservations[0].Instances[0];
    
    return {
      instanceId: instance.InstanceId,
      publicIp: instance.PublicIpAddress,
      publicDns: instance.PublicDnsName
    };
  } catch (error) {
    console.error('Error starting EC2 instance:', error);
    throw error;
  }
};

// Stop an EC2 instance
const stopInstance = async (instanceId) => {
  try {
    const stopInstancesCommand = new StopInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(stopInstancesCommand);
    
    // Wait for instance to stop
    await waitUntilInstanceStopped(
      { client: ec2Client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] }
    );
    
    return true;
  } catch (error) {
    console.error(`Error stopping instance ${instanceId}:`, error);
    throw error;
  }
};

// Restart an EC2 instance
const restartInstance = async (instanceId) => {
  try {
    const rebootInstancesCommand = new RebootInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(rebootInstancesCommand);
    
    // Wait for instance to be running
    await waitUntilInstanceRunning(
      { client: ec2Client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] }
    );
    
    return true;
  } catch (error) {
    console.error(`Error restarting instance ${instanceId}:`, error);
    throw error;
  }
};

// Terminate an EC2 instance
const terminateInstance = async (instanceId) => {
  try {
    const terminateInstancesCommand = new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(terminateInstancesCommand);
    
    // Wait for instance to terminate
    await waitUntilInstanceTerminated(
      { client: ec2Client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] }
    );
    
    return true;
  } catch (error) {
    console.error(`Error terminating instance ${instanceId}:`, error);
    throw error;
  }
};

// Get EC2 instance status
const getInstanceStatus = async (instanceId) => {
  try {
    const describeInstanceStatusCommand = new DescribeInstanceStatusCommand({
      InstanceIds: [instanceId],
      IncludeAllInstances: true
    });
    
    const result = await ec2Client.send(describeInstanceStatusCommand);
    
    if (result.InstanceStatuses.length === 0) {
      return 'unknown';
    }
    
    const state = result.InstanceStatuses[0].InstanceState.Name;
    
    // Map EC2 state to application state
    switch (state) {
      case 'pending':
        return 'starting';
      case 'running':
        return 'running';
      case 'stopping':
        return 'stopping';
      case 'stopped':
        return 'stopped';
      case 'shutting-down':
      case 'terminated':
        return 'terminated';
      default:
        return state;
    }
  } catch (error) {
    console.error(`Error getting instance status for ${instanceId}:`, error);
    throw error;
  }
};

// Get logs from EC2 instance
const getInstanceLogs = async (instanceId) => {
  try {
    // TODO: Implement proper log retrieval using AWS Systems Manager or CloudWatch Logs
    // For now, return dummy logs
    return [
      { timestamp: new Date().toISOString(), message: 'Application started' },
      { timestamp: new Date().toISOString(), message: 'Listening on port 80' }
    ];
  } catch (error) {
    console.error(`Error getting logs for instance ${instanceId}:`, error);
    throw error;
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  startInstance,
  stopInstance,
  restartInstance,
  terminateInstance,
  getInstanceStatus,
  getInstanceLogs
};
