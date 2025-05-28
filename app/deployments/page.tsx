"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DeploymentsPage() {
  const allDeployments = [
    {
      app_id: "app-demo-1",
      name: "My Web App",
      status: "running",
      deployment_mode: "docker",
      public_ip: "54.123.45.67",
      created_at: "Today",
    },
    {
      app_id: "app-demo-2",
      name: "API Service",
      status: "stopped",
      deployment_mode: "docker-compose",
      created_at: "2 days ago",
    },
    {
      app_id: "app-demo-3",
      name: "Database Service",
      status: "running",
      deployment_mode: "docker",
      public_ip: "54.123.45.68",
      created_at: "1 week ago",
    },
    {
      app_id: "app-demo-4",
      name: "Frontend App",
      status: "pending",
      deployment_mode: "docker-compose",
      created_at: "2 weeks ago",
    },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              All Deployments
            </h1>
            <Link href="/">
              <Button>New Deployment</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {allDeployments.map((deployment) => (
              <Card key={deployment.app_id} className="cursor-pointer card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {deployment.name}
                        </h4>
                        <Badge className={`ml-3 ${getStatusClass(deployment.status)}`}>{deployment.status}</Badge>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 transition-colors duration-300">
                        <span>{deployment.deployment_mode}</span>
                        <span>{deployment.created_at}</span>
                        {deployment.public_ip && <span>{deployment.public_ip}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deployment.public_ip && deployment.status === "running" && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`http://${deployment.public_ip}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      <Link href={`/deployments/${deployment.app_id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
