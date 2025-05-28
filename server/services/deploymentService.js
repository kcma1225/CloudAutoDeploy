const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Path to the data directory where deployment data will be stored
const DATA_DIR = path.join(__dirname, '..', 'data');
const DEPLOYMENTS_FILE = path.join(DATA_DIR, 'deployments.json');

// Initialize data directory and deployments file if they don't exist
const initDataStore = async () => {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      await mkdirAsync(DATA_DIR, { recursive: true });
    }
    
    // Create deployments file if it doesn't exist
    if (!fs.existsSync(DEPLOYMENTS_FILE)) {
      await writeFileAsync(DEPLOYMENTS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data store:', error);
    throw error;
  }
};

// Get all deployments
const getAllDeployments = async () => {
  try {
    await initDataStore();
    
    const data = await readFileAsync(DEPLOYMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting all deployments:', error);
    throw error;
  }
};

// Get deployment by ID
const getDeploymentById = async (id) => {
  try {
    const deployments = await getAllDeployments();
    return deployments.find(deployment => deployment.id === id);
  } catch (error) {
    console.error(`Error getting deployment ${id}:`, error);
    throw error;
  }
};

// Save deployment data
const saveDeployment = async (deploymentData) => {
  try {
    await initDataStore();
    
    let deployments = await getAllDeployments();
    
    // Check if deployment already exists
    const existingIndex = deployments.findIndex(d => d.id === deploymentData.id);
    
    if (existingIndex !== -1) {
      // Update existing deployment
      deployments[existingIndex] = {
        ...deployments[existingIndex],
        ...deploymentData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new deployment
      deployments.push(deploymentData);
    }
    
    // Write updated deployments back to file
    await writeFileAsync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2));
    
    return deploymentData;
  } catch (error) {
    console.error(`Error saving deployment ${deploymentData.id}:`, error);
    throw error;
  }
};

// Update deployment status
const updateStatus = async (id, status) => {
  try {
    const deployment = await getDeploymentById(id);
    
    if (!deployment) {
      throw new Error(`Deployment ${id} not found`);
    }
    
    deployment.status = status;
    deployment.updatedAt = new Date().toISOString();
    
    await saveDeployment(deployment);
    
    return deployment;
  } catch (error) {
    console.error(`Error updating status for deployment ${id}:`, error);
    throw error;
  }
};

// Delete deployment
const deleteDeployment = async (id) => {
  try {
    const deployments = await getAllDeployments();
    
    const updatedDeployments = deployments.filter(deployment => deployment.id !== id);
    
    await writeFileAsync(DEPLOYMENTS_FILE, JSON.stringify(updatedDeployments, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Error deleting deployment ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllDeployments,
  getDeploymentById,
  saveDeployment,
  updateStatus,
  deleteDeployment
};
