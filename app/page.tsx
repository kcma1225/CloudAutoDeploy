"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import {
  Upload,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  EyeOff,
  Eye,
  Edit,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { dashboardStats, recentDeployments } from "@/lib/data"

interface EnvironmentVariable {
  key: string
  value: string
  showValue: boolean
  isEditing: boolean
  editValue: string
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deploymentMode, setDeploymentMode] = useState<"docker" | "docker-compose">("docker")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Environment Variables State
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([])
  const [newVariable, setNewVariable] = useState({ key: "", value: "" })
  const [rawParameters, setRawParameters] = useState("")

  // Environment Variables Functions
  const addVariable = () => {
    if (newVariable.key && newVariable.value) {
      setEnvironmentVariables([
        ...environmentVariables,
        {
          key: newVariable.key,
          value: newVariable.value,
          showValue: false,
          isEditing: false,
          editValue: newVariable.value,
        },
      ])
      setNewVariable({ key: "", value: "" })
    }
  }

  const removeVariable = (index: number) => {
    setEnvironmentVariables(environmentVariables.filter((_, i) => i !== index))
  }

  const toggleValueVisibility = (index: number) => {
    const updated = [...environmentVariables]
    updated[index].showValue = !updated[index].showValue
    setEnvironmentVariables(updated)
  }

  const toggleEdit = (index: number) => {
    const updated = [...environmentVariables]
    const variable = updated[index]
    if (variable.isEditing) {
      variable.value = variable.editValue
    } else {
      variable.editValue = variable.value
    }
    variable.isEditing = !variable.isEditing
    setEnvironmentVariables(updated)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const files = event.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeploy = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
            setSelectedFile(null)
            alert("Deployment started successfully!")
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getStatusClass = (status: "running" | "stopped" | "pending" | "starting" | "failed"): string => {
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Deploy and manage your applications with ease</p>
            </div>
            <Link href="/deployments">
              <Button className="btn-primary">
                <Upload className="mr-2 h-4 w-4" />
                View All Deployments
              </Button>
            </Link>
          </div>

          {/* Stats Cards - USING DASHBOARD STATS OBJECT */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalDeployments}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeDeployments}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Building</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.buildingDeployments}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.failedDeployments}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Deploy New Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Application Archive
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 ${
                    isDragging ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        Drop your archive here, or{" "}
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300">
                          browse
                        </span>
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".zip,.tar.gz"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      ZIP or TAR.GZ files only
                    </p>
                  </div>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 transition-colors duration-300" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {selectedFile.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          ({formatFileSize(selectedFile.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-300"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Deployment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Deployment Mode
                </label>
                <Tabs
                  value={deploymentMode}
                  onValueChange={(value) => setDeploymentMode(value as "docker" | "docker-compose")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="docker">Docker</TabsTrigger>
                    <TabsTrigger value="docker-compose">Docker Compose</TabsTrigger>
                  </TabsList>
                  <TabsContent value="docker" className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Single container deployment with configurable environment variables
                    </p>
                  </TabsContent>
                  <TabsContent value="docker-compose" className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Multi-container deployment using docker-compose.yml configuration
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Environment Variables - Only show for Docker mode */}
              {deploymentMode === "docker" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
                    Environment Variables
                  </label>

                  {/* Add New Variable */}
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                        Add New Variable
                      </h4>
                      <div className="flex gap-3">
                        <Input
                          value={newVariable.key}
                          onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                          placeholder="Key"
                          className="flex-1"
                        />
                        <Input
                          value={newVariable.value}
                          onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button onClick={addVariable} disabled={!newVariable.key || !newVariable.value} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variable List */}
                  {environmentVariables.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                        Variable List
                      </h4>
                      <div className="space-y-2">
                        {environmentVariables.map((variable, index) => (
                          <Card key={index} className="card-hover">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                                      {variable.key}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {!variable.isEditing ? (
                                      <span className="text-sm text-gray-600 dark:text-gray-300 font-mono transition-colors duration-300">
                                        {variable.showValue ? variable.value : "••••••••"}
                                      </span>
                                    ) : (
                                      <Input
                                        value={variable.editValue}
                                        onChange={(e) => {
                                          const updated = [...environmentVariables]
                                          updated[index].editValue = e.target.value
                                          setEnvironmentVariables(updated)
                                        }}
                                        className="text-sm"
                                        size="sm"
                                      />
                                    )}
                                    {!variable.isEditing && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleValueVisibility(index)}
                                        className="ml-2 h-6 w-6 p-0"
                                      >
                                        {variable.showValue ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleEdit(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {!variable.isEditing ? <Edit className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariable(index)}
                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Parameters (Optional) */}
                  <div className="mt-6">
                    <label
                      htmlFor="raw-params"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Additional Docker Parameters (Optional)
                    </label>
                    <Textarea
                      id="raw-params"
                      value={rawParameters}
                      onChange={(e) => setRawParameters(e.target.value)}
                      rows={2}
                      placeholder="e.g., --network=host --restart=unless-stopped"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Additional Docker runtime parameters (network settings, restart policies, etc.)
                    </p>
                  </div>
                </div>
              )}

              {/* Docker Compose Info - Only show for Docker Compose mode */}
              {deploymentMode === "docker-compose" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400 dark:text-blue-300 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 transition-colors duration-300">
                        Docker Compose Configuration
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 transition-colors duration-300">
                        <p>
                          Environment variables and service configuration should be defined in your docker-compose.yml
                          file.
                        </p>
                        <p className="mt-1">
                          Make sure your compose file includes all necessary environment variables, volumes, and network
                          settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button onClick={handleDeploy} disabled={!selectedFile || isUploading} className="flex items-center">
                  {!isUploading ? (
                    <Upload className="h-5 w-5 mr-2" />
                  ) : (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  )}
                  {isUploading ? "Deploying..." : "Deploy Application"}
                </Button>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && <Progress value={uploadProgress} className="w-full" />}
            </CardContent>
          </Card>

          {/* Recent Deployments */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
