"use client"

import { useState } from "react"
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, HardDrive, Network, Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for Kubernetes clusters
const clusters = [
  {
    id: "prod-cluster-1",
    name: "Production Cluster",
    status: "healthy",
    version: "v1.28.2",
    nodes: 5,
    pods: 127,
    services: 23,
    region: "us-east-1",
    provider: "AWS EKS",
  },
  {
    id: "staging-cluster",
    name: "Staging Cluster",
    status: "warning",
    version: "v1.27.8",
    nodes: 3,
    pods: 45,
    services: 12,
    region: "us-west-2",
    provider: "AWS EKS",
  },
  {
    id: "dev-cluster",
    name: "Development Cluster",
    status: "healthy",
    version: "v1.28.2",
    nodes: 2,
    pods: 28,
    services: 8,
    region: "eu-west-1",
    provider: "GKE",
  },
]

const nodes = [
  {
    name: "node-1",
    status: "Ready",
    role: "control-plane",
    age: "45d",
    version: "v1.28.2",
    cpu: { used: 65, total: 100 },
    memory: { used: 78, total: 100 },
    pods: { used: 12, total: 20 },
  },
  {
    name: "node-2",
    status: "Ready",
    role: "worker",
    age: "45d",
    version: "v1.28.2",
    cpu: { used: 45, total: 100 },
    memory: { used: 62, total: 100 },
    pods: { used: 8, total: 20 },
  },
  {
    name: "node-3",
    status: "Ready",
    role: "worker",
    age: "30d",
    version: "v1.28.2",
    cpu: { used: 72, total: 100 },
    memory: { used: 85, total: 100 },
    pods: { used: 15, total: 20 },
  },
  {
    name: "node-4",
    status: "NotReady",
    role: "worker",
    age: "12d",
    version: "v1.28.2",
    cpu: { used: 0, total: 100 },
    memory: { used: 0, total: 100 },
    pods: { used: 0, total: 20 },
  },
]

const pods = [
  {
    name: "frontend-deployment-7d4b8c9f5-abc12",
    namespace: "default",
    status: "Running",
    ready: "1/1",
    restarts: 0,
    age: "2d",
    node: "node-2",
  },
  {
    name: "backend-api-6c8d9e2a1-def34",
    namespace: "default",
    status: "Running",
    ready: "1/1",
    restarts: 2,
    age: "5d",
    node: "node-3",
  },
  {
    name: "database-statefulset-0",
    namespace: "database",
    status: "Running",
    ready: "1/1",
    restarts: 0,
    age: "15d",
    node: "node-1",
  },
  {
    name: "monitoring-prometheus-0",
    namespace: "monitoring",
    status: "Pending",
    ready: "0/1",
    restarts: 0,
    age: "1h",
    node: "node-4",
  },
  {
    name: "ingress-nginx-controller-xyz89",
    namespace: "ingress-nginx",
    status: "Running",
    ready: "1/1",
    restarts: 1,
    age: "7d",
    node: "node-2",
  },
]

export function KubernetesDashboard() {
  const [selectedCluster, setSelectedCluster] = useState(clusters[0].id)
  const currentCluster = clusters.find((c) => c.id === selectedCluster) || clusters[0]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "Running":
      case "Ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
      case "Pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "NotReady":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant =
      status === "healthy" || status === "Running" || status === "Ready"
        ? "default"
        : status === "warning" || status === "Pending"
          ? "secondary"
          : "destructive"

    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <Server className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Kubernetes Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select cluster" />
              </SelectTrigger>
              <SelectContent>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(cluster.status)}
                      <span>{cluster.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {/* Cluster Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{currentCluster.name}</h2>
              <p className="text-muted-foreground">
                {currentCluster.provider} • {currentCluster.region} • {currentCluster.version}
              </p>
            </div>
            {getStatusBadge(currentCluster.status)}
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nodes</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentCluster.nodes}</div>
                <p className="text-xs text-muted-foreground">
                  {nodes.filter((n) => n.status === "Ready").length} ready
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pods</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentCluster.pods}</div>
                <p className="text-xs text-muted-foreground">
                  {pods.filter((p) => p.status === "Running").length} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentCluster.services}</div>
                <p className="text-xs text-muted-foreground">Active services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">64%</div>
                <Progress value={64} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="nodes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="pods">Pods</TabsTrigger>
            <TabsTrigger value="workloads">Workloads</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Nodes</CardTitle>
                <CardDescription>Overview of all nodes in the cluster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodes.map((node) => (
                    <div key={node.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(node.status)}
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {node.role} • {node.version} • {node.age}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">CPU</div>
                          <div className="text-xs text-muted-foreground">{node.cpu.used}%</div>
                          <Progress value={node.cpu.used} className="w-16 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Memory</div>
                          <div className="text-xs text-muted-foreground">{node.memory.used}%</div>
                          <Progress value={node.memory.used} className="w-16 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Pods</div>
                          <div className="text-xs text-muted-foreground">
                            {node.pods.used}/{node.pods.total}
                          </div>
                          <Progress value={(node.pods.used / node.pods.total) * 100} className="w-16 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pods" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Running Pods</CardTitle>
                <CardDescription>All pods across namespaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pods.map((pod) => (
                    <div key={pod.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(pod.status)}
                        <div>
                          <div className="font-medium text-sm">{pod.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pod.namespace} • {pod.node}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Ready</div>
                          <div>{pod.ready}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Restarts</div>
                          <div>{pod.restarts}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Age</div>
                          <div>{pod.age}</div>
                        </div>
                        {getStatusBadge(pod.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workloads" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Deployments</CardTitle>
                  <CardDescription>Application deployments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">frontend-deployment</div>
                        <div className="text-sm text-muted-foreground">default</div>
                      </div>
                      <Badge>3/3 Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">backend-api</div>
                        <div className="text-sm text-muted-foreground">default</div>
                      </div>
                      <Badge>2/2 Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>StatefulSets</CardTitle>
                  <CardDescription>Stateful applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">database</div>
                        <div className="text-sm text-muted-foreground">database</div>
                      </div>
                      <Badge>1/1 Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">prometheus</div>
                        <div className="text-sm text-muted-foreground">monitoring</div>
                      </div>
                      <Badge variant="secondary">0/1 Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Persistent Volumes</CardTitle>
                  <CardDescription>Storage volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4" />
                        <div>
                          <div className="font-medium">pv-database-data</div>
                          <div className="text-sm text-muted-foreground">100Gi</div>
                        </div>
                      </div>
                      <Badge>Bound</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4" />
                        <div>
                          <div className="font-medium">pv-logs-storage</div>
                          <div className="text-sm text-muted-foreground">50Gi</div>
                        </div>
                      </div>
                      <Badge>Bound</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Classes</CardTitle>
                  <CardDescription>Available storage types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">gp3-ssd</div>
                        <div className="text-sm text-muted-foreground">AWS EBS GP3</div>
                      </div>
                      <Badge variant="outline">Default</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">fast-ssd</div>
                        <div className="text-sm text-muted-foreground">High IOPS</div>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
