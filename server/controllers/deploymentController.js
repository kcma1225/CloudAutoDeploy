const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const awsService = require('../services/awsService');
const deploymentService = require('../services/deploymentService');

// Get all deployments
exports.listDeployments = async (req, res) => {
  try {
    const deployments = await deploymentService.getAllDeployments();
    res.json(deployments);
  } catch (error) {
    console.error('Error listing deployments:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get a specific deployment
exports.getDeployment = async (req, res) => {
  try {
    const deployment = await deploymentService.getDeploymentById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (error) {
    console.error('Error getting deployment:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Create a new deployment
exports.createDeployment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No project archive uploaded' });
    }

    const { name, description, envVars } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: true, message: 'Deployment name is required' });
    }

    // Create a new deployment
    const deploymentId = uuidv4();
    const deploymentData = {
      id: deploymentId,
      name,
      description: description || '',
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      envVars: envVars ? JSON.parse(envVars) : {},
      filePath: req.file.path,
      fileName: req.file.originalname,
      instanceId: null,
      publicIp: null,
      publicDns: null
    };

    // Save deployment metadata
    await deploymentService.saveDeployment(deploymentData);
    
    // Upload the project archive to S3
    await awsService.uploadToS3(req.file.path, deploymentId);

    res.status(201).json(deploymentData);
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update deployment configuration
exports.updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { envVars, resources } = req.body;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    // Update deployment configuration
    const updatedDeployment = {
      ...deployment,
      envVars: envVars ? JSON.parse(envVars) : deployment.envVars,
      resources: resources || deployment.resources,
      updatedAt: new Date().toISOString()
    };
    
    await deploymentService.saveDeployment(updatedDeployment);
    
    res.json(updatedDeployment);
  } catch (error) {
    console.error('Error updating deployment config:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Start a deployment
exports.startDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    if (deployment.status === 'running') {
      return res.status(400).json({ error: true, message: 'Deployment is already running' });
    }
    
    // Update status to starting
    await deploymentService.updateStatus(id, 'starting');
    
    // Start the EC2 instance
    const instanceDetails = await awsService.startInstance(id, deployment);
    
    // Update deployment with instance details
    const updatedDeployment = {
      ...deployment,
      status: 'running',
      instanceId: instanceDetails.instanceId,
      publicIp: instanceDetails.publicIp,
      publicDns: instanceDetails.publicDns,
      updatedAt: new Date().toISOString()
    };
    
    await deploymentService.saveDeployment(updatedDeployment);
    
    res.json(updatedDeployment);
  } catch (error) {
    console.error('Error starting deployment:', error);
    
    // Update status to failed on error
    await deploymentService.updateStatus(req.params.id, 'failed');
    
    res.status(500).json({ error: true, message: error.message });
  }
};

// Stop a deployment
exports.stopDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    if (deployment.status !== 'running') {
      return res.status(400).json({ error: true, message: 'Deployment is not running' });
    }
    
    // Update status to stopping
    await deploymentService.updateStatus(id, 'stopping');
    
    // Stop the EC2 instance
    await awsService.stopInstance(deployment.instanceId);
    
    // Update deployment status
    const updatedDeployment = {
      ...deployment,
      status: 'stopped',
      updatedAt: new Date().toISOString()
    };
    
    await deploymentService.saveDeployment(updatedDeployment);
    
    res.json(updatedDeployment);
  } catch (error) {
    console.error('Error stopping deployment:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Restart a deployment
exports.restartDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    // Update status to restarting
    await deploymentService.updateStatus(id, 'restarting');
    
    // Restart the EC2 instance
    await awsService.restartInstance(deployment.instanceId);
    
    // Update deployment status
    const updatedDeployment = {
      ...deployment,
      status: 'running',
      updatedAt: new Date().toISOString()
    };
    
    await deploymentService.saveDeployment(updatedDeployment);
    
    res.json(updatedDeployment);
  } catch (error) {
    console.error('Error restarting deployment:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete a deployment
exports.deleteDeployment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    // If deployment has an instance, terminate it
    if (deployment.instanceId) {
      await awsService.terminateInstance(deployment.instanceId);
    }
    
    // Delete deployment files from S3
    await awsService.deleteFromS3(id);
    
    // Delete deployment metadata
    await deploymentService.deleteDeployment(id);
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting deployment:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get deployment logs
exports.getDeploymentLogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    if (!deployment.instanceId) {
      return res.status(400).json({ error: true, message: 'Deployment has no active instance' });
    }
    
    // Get logs from EC2 instance
    const logs = await awsService.getInstanceLogs(deployment.instanceId);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error getting deployment logs:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get deployment status
exports.getDeploymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deployment = await deploymentService.getDeploymentById(id);
    
    if (!deployment) {
      return res.status(404).json({ error: true, message: 'Deployment not found' });
    }
    
    // If deployment has an instance, get its status
    if (deployment.instanceId) {
      const instanceStatus = await awsService.getInstanceStatus(deployment.instanceId);
      
      // Update deployment status if changed
      if (instanceStatus !== deployment.status) {
        await deploymentService.updateStatus(id, instanceStatus);
        deployment.status = instanceStatus;
      }
    }
    
    res.json({ 
      id: deployment.id,
      status: deployment.status,
      instanceId: deployment.instanceId,
      publicIp: deployment.publicIp,
      publicDns: deployment.publicDns,
      updatedAt: deployment.updatedAt
    });
  } catch (error) {
    console.error('Error getting deployment status:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
