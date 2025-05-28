"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Play, Pause, RotateCcw, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function DeploymentDetailPage() {
  const params = useParams()
  const deploymentId = params.id

  // Mock deployment data - in real app, fetch based on ID
  const deployment = {
    app_id: deploymentId,
    name: "My Web App (I'm edit)",
    status: "running",
    deployment_mode: "docker",
    public_ip: "54.123.45.67",
    created_at: "Today",
  }

  const [logs] = useState([
    { timestamp: "14:30:15", message: "Starting deployment..." },
    { timestamp: "14:30:16", message: "Pulling Docker image..." },
    { timestamp: "14:30:20", message: "Container started successfully" },
    { timestamp: "14:30:21", message: "Application is running on port 8080" },
  ])

  const getStatusClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
      case "starting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusDotClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-400 status-dot"
      case "stopped":
        return "bg-red-400"
      case "pending":
      case "starting":
        return "bg-yellow-400 pulse-glow"
      default:
        return "bg-gray-400"
    }
  }

  const performAction = (action: string) => {
    alert(`Performing ${action} action on deployment ${deployment.app_id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Deployment Details
            </h1>
            <Link href="/deployments">
              <Button variant="outline">← Back to Deployments</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status and Controls */}
            <div className="space-y-6">
              {/* Status */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-300">
                      Status:
                    </span>
                    <Badge className={getStatusClass(deployment.status)}>
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${getStatusDotClass(deployment.status)}`}></div>
                      {deployment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-300">
                      Public IP:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono transition-colors duration-300">
                      {deployment.public_ip || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-300">
                      App ID:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono transition-colors duration-300">
                      {deployment.app_id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 transition-colors duration-300">
                      Mode:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {deployment.deployment_mode}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Controls */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Deployment Controls</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={() => performAction("start")}
                      disabled={deployment.status === "running"}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-12 flex items-center justify-center gap-2 font-medium transition-all duration-300"
                      size="lg"
                    >
                      <Play className="h-5 w-5" />
                      Start
                    </Button>

                    <Button
                      onClick={() => performAction("stop")}
                      disabled={deployment.status === "stopped"}
                      variant="secondary"
                      className="h-12 flex items-center justify-center gap-2 font-medium"
                      size="lg"
                    >
                      <Pause className="h-5 w-5" />
                      Stop
                    </Button>

                    <Button
                      onClick={() => performAction("restart")}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 h-12 flex items-center justify-center gap-2 font-medium transition-all duration-300"
                      size="lg"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Restart
                    </Button>

                    <Button
                      onClick={() => performAction("terminate")}
                      variant="destructive"
                      className="h-12 flex items-center justify-center gap-2 font-medium"
                      size="lg"
                    >
                      <Trash2 className="h-5 w-5" />
                      Terminate
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        Quick Actions
                      </span>
                      <div className="flex items-center gap-4">
                        {deployment.public_ip && deployment.status === "running" && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`http://${deployment.public_ip}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open App
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Refresh Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Logs */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Real-time Logs</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500 status-dot"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      Connected
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-300 font-mono text-sm p-4 rounded transition-colors duration-300">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        [{log.timestamp}]
                      </span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Waiting for logs...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
