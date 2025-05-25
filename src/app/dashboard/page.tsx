"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Activity, Cpu, HardDrive, MapPin, Search, Server, Users, ExternalLink, RefreshCw } from "lucide-react"

// Mock data for Kubernetes clusters
const clusters = [
  {
    id: "prod-us-east-1",
    name: "Production US East",
    status: "running",
    region: "us-east-1",
    version: "v1.28.3",
    nodes: 12,
    cpuUsage: 68,
    memoryUsage: 72,
    pods: 156,
    services: 23,
    uptime: "45 days",
    lastUpdated: "2 minutes ago",
  },
  {
    id: "staging-eu-west-1",
    name: "Staging EU West",
    status: "running",
    region: "eu-west-1",
    version: "v1.28.1",
    nodes: 6,
    cpuUsage: 34,
    memoryUsage: 45,
    pods: 78,
    services: 12,
    uptime: "12 days",
    lastUpdated: "5 minutes ago",
  },
  {
    id: "dev-us-west-2",
    name: "Development US West",
    status: "running",
    region: "us-west-2",
    version: "v1.27.8",
    nodes: 3,
    cpuUsage: 23,
    memoryUsage: 31,
    pods: 42,
    services: 8,
    uptime: "8 days",
    lastUpdated: "1 minute ago",
  },
  {
    id: "test-ap-south-1",
    name: "Testing Asia Pacific",
    status: "running",
    region: "ap-south-1",
    version: "v1.28.3",
    nodes: 4,
    cpuUsage: 15,
    memoryUsage: 28,
    pods: 24,
    services: 5,
    uptime: "3 days",
    lastUpdated: "8 minutes ago",
  },
  {
    id: "backup-eu-central-1",
    name: "Backup EU Central",
    status: "running",
    region: "eu-central-1",
    version: "v1.28.2",
    nodes: 2,
    cpuUsage: 8,
    memoryUsage: 12,
    pods: 18,
    services: 3,
    uptime: "21 days",
    lastUpdated: "15 minutes ago",
  },
]

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredClusters = clusters.filter(
    (cluster) =>
      cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleClusterClick = (clusterId: string) => {
    // You can customize this to redirect to your desired page
    console.log(`Redirecting to cluster details: ${clusterId}`)
    // Example: router.push(`/clusters/${clusterId}`)
    // Or: window.location.href = `/cluster-details?id=${clusterId}`
    alert(`Redirecting to cluster: ${clusterId}`)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "stopped":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-600"
    if (usage >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kubernetes Clusters</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your running clusters</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clusters by name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{clusters.length}</div>
                <div className="text-sm text-gray-600">Running Clusters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {clusters.reduce((sum, cluster) => sum + cluster.nodes, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {clusters.reduce((sum, cluster) => sum + cluster.pods, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Pods</div>
              </div>
            </div>
          </div>
        </div>

        {/* Clusters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClusters.map((cluster) => (
            <Card
              key={cluster.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
              onClick={() => handleClusterClick(cluster.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{cluster.name}</CardTitle>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {cluster.region}
                  <Badge variant="secondary" className="ml-auto">
                    {cluster.version}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(cluster.status)}`} />
                  <span className="text-sm font-medium capitalize">{cluster.status}</span>
                  <span className="text-xs text-gray-500 ml-auto">Uptime: {cluster.uptime}</span>
                </div>

                {/* Resource Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span>CPU Usage</span>
                    </div>
                    <span className={`font-medium ${getUsageColor(cluster.cpuUsage)}`}>{cluster.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${cluster.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-500" />
                      <span>Memory Usage</span>
                    </div>
                    <span className={`font-medium ${getUsageColor(cluster.memoryUsage)}`}>{cluster.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${cluster.memoryUsage}%` }}
                    />
                  </div>
                </div>

                {/* Cluster Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Server className="h-3 w-3" />
                      <span>Nodes</span>
                    </div>
                    <div className="font-semibold text-lg">{cluster.nodes}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Activity className="h-3 w-3" />
                      <span>Pods</span>
                    </div>
                    <div className="font-semibold text-lg">{cluster.pods}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>Services</span>
                    </div>
                    <div className="font-semibold text-lg">{cluster.services}</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 pt-2 border-t">Last updated: {cluster.lastUpdated}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredClusters.length === 0 && (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clusters found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
