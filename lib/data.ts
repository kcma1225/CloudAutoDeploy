// 🎯 CENTRALIZED DATA FILE - EDIT THIS TO CHANGE ALL DATA ACROSS THE APP

export interface Deployment {
  app_id: string
  name: string
  status: "running" | "stopped" | "pending" | "starting" | "failed"
  deployment_mode: "docker" | "docker-compose"
  public_ip?: string
  created_at: string
}

export interface DashboardStats {
  totalDeployments: number
  activeDeployments: number
  buildingDeployments: number
  failedDeployments: number
}

// 🎯 EDIT THESE VALUES TO CHANGE YOUR DASHBOARD
export const dashboardStats: DashboardStats = {
  totalDeployments: 0, 
  activeDeployments: 0, 
  buildingDeployments: 0, 
  failedDeployments: 0, 
}

// 🎯 EDIT THESE DEPLOYMENTS TO CHANGE WHAT SHOWS UP
export const allDeployments: Deployment[] = [
  {
    app_id: "app-demo-1",
    name: "🚀 My Amazing Web App", // ← CHANGE THIS NAME
    status: "running",
    deployment_mode: "docker",
    public_ip: "54.123.45.67",
    created_at: "Today",
  },
  {
    app_id: "app-demo-2",
    name: "🔥 Super Fast API", // ← CHANGE THIS NAME
    status: "stopped",
    deployment_mode: "docker-compose",
    created_at: "2 days ago",
  },
  {
    app_id: "app-demo-3",
    name: "💾 Database Service",
    status: "running",
    deployment_mode: "docker",
    public_ip: "54.123.45.68",
    created_at: "1 week ago",
  },
  {
    app_id: "app-demo-4",
    name: "🎨 Frontend App",
    status: "pending",
    deployment_mode: "docker-compose",
    created_at: "2 weeks ago",
  },
  {
    app_id: "app-demo-5",
    name: "🤖 AI Service", // ← ADD NEW DEPLOYMENTS HERE
    status: "failed",
    deployment_mode: "docker",
    created_at: "3 days ago",
  },
]

// Get recent deployments (first 2)
export const recentDeployments = allDeployments.slice(0, 2)

// Get deployment by ID
export function getDeploymentById(id: string): Deployment | undefined {
  return allDeployments.find((deployment) => deployment.app_id === id)
}

// 🎯 MOCK LOGS - EDIT THESE TO CHANGE LOG MESSAGES
export const mockLogs = [
  { timestamp: "14:30:15", message: "🚀 Starting deployment..." },
  { timestamp: "14:30:16", message: "📦 Pulling Docker image..." },
  { timestamp: "14:30:20", message: "✅ Container started successfully" },
  { timestamp: "14:30:21", message: "🌐 Application is running on port 8080" },
  { timestamp: "14:30:22", message: "🔍 Health check passed" },
]
