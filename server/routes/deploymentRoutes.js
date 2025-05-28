const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const deploymentController = require('../controllers/deploymentController');

// Configure storage for project uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// List all deployments
router.get('/deployments', deploymentController.listDeployments);

// Get a specific deployment
router.get('/deployments/:id', deploymentController.getDeployment);

// Create a new deployment
router.post('/deployments', upload.single('projectArchive'), deploymentController.createDeployment);

// Update deployment configuration
router.put('/deployments/:id/config', deploymentController.updateConfig);

// Deployment control endpoints
router.post('/deployments/:id/start', deploymentController. startDeployment);
router.post('/deployments/:id/stop', deploymentController.stopDeployment);
router.post('/deployments/:id/restart', deploymentController.restartDeployment);

// Delete a deployment
router.delete('/deployments/:id', deploymentController.deleteDeployment);

// Get deployment logs
router.get('/deployments/:id/logs', deploymentController.getDeploymentLogs);

// Get deployment status
router.get('/deployments/:id/status', deploymentController.getDeploymentStatus);

module.exports = router;
