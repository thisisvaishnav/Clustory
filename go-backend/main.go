package main // Declares this file as part of the main package, making it executable

import (
	"context"       // For context control in API requests
	"flag"          // For command-line flag parsing
	"fmt"           // For string formatting functions
	"net/http"      // For HTTP server and client functionality
	"os"            // For operating system functionality like environment variables
	"path/filepath" // For manipulating file paths in a cross-platform way

	"github.com/gin-gonic/gin"                    // Imports Gin web framework for HTTP routing
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1" // For Kubernetes API metadata types
	"k8s.io/client-go/kubernetes"                 // Official Kubernetes Go client
	"k8s.io/client-go/rest"                       // For in-cluster Kubernetes configuration
	"k8s.io/client-go/tools/clientcmd"            // For building Kubernetes client configuration

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/mem"
)

// ClusterInfo defines the structure for the JSON response
type ClusterInfo struct {
	Nodes     []string            `json:"nodes"`     // Array of node names
	Pods      []map[string]string `json:"pods"`      // Array of pod info including node assignment
	NodesPods map[string][]string `json:"nodesPods"` // Map of node names to list of pods running on that node
}

// CPUInfo struct
type CPUInfo struct {
	Usage float64 `json:"usage"`
}

// MemoryInfo struct
type MemoryInfo struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
}

// DiskInfo struct
type DiskInfo struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
	Path        string  `json:"path"`
}

func main() {
	// You can add a flag to accept kubeconfig path from CLI
	kubeconfig := flag.String("kubeconfig", filepath.Join(os.Getenv("HOME"), ".kube", "config"), "path to kubeconfig file")
	port := flag.String("port", "8080", "port to run the server on")
	flag.Parse()

	r := gin.Default() // Initialize a Gin router with default middleware (logger and recovery)

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	// Define a GET endpoint at /api/k8sinfo
	r.GET("/api/k8sinfo", func(c *gin.Context) {
		info, err := fetchClusterInfo(*kubeconfig) // Call the function to get Kubernetes cluster information
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) // Return error as JSON with 500 status code
			return
		}
		c.JSON(http.StatusOK, info) // Return cluster info as JSON with 200 status code
	})

	// Metrics endpoints
	r.GET("/api/metrics/cpu", getCPUInfo)
	r.GET("/api/metrics/memory", getMemoryInfo)
	r.GET("/api/metrics/disk", getDiskInfo)

	r.Run(":" + *port) // Start the HTTP server on specified port
}

// fetchClusterInfo connects to a Kubernetes cluster and retrieves node and pod information
func fetchClusterInfo(kubeconfigPath string) (*ClusterInfo, error) {
	// Use the kubeconfig file explicitly
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfigPath) // Build Kubernetes client config from kubeconfig file
	if err != nil {
		// fallback to in-cluster config if kubeconfig fails
		config, err = rest.InClusterConfig()
		if err != nil {
			return nil, fmt.Errorf("failed to create k8s config: %v", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config) // Create Kubernetes client from config
	if err != nil {
		return nil, fmt.Errorf("failed to create k8s clientset: %v", err)
	}

	// Get Nodes from the Kubernetes API
	nodeList, err := clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get nodes: %v", err) // Return detailed error
	}

	var nodeNames []string                // Initialize slice to store node names
	for _, node := range nodeList.Items { // Iterate through all nodes
		nodeNames = append(nodeNames, node.Name) // Add each node name to the slice
	}

	// Get Pods from all namespaces (empty string means all namespaces)
	podList, err := clientset.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get pods: %v", err) // Return detailed error
	}

	// Initialize slice to store pod information with node assignment
	var podsWithNodes []map[string]string

	// Create a map of nodes to their pods
	nodesPods := make(map[string][]string)

	for _, pod := range podList.Items { // Iterate through all pods
		podFullName := pod.Namespace + "/" + pod.Name
		nodeName := pod.Spec.NodeName

		// Add to podsWithNodes array
		podsWithNodes = append(podsWithNodes, map[string]string{
			"name": podFullName,
			"node": nodeName,
		})

		// Add to nodesPods map
		nodesPods[nodeName] = append(nodesPods[nodeName], podFullName)
	}

	// Return a new ClusterInfo struct with the collected data
	return &ClusterInfo{
		Nodes:     nodeNames,
		Pods:      podsWithNodes,
		NodesPods: nodesPods,
	}, nil
}

func getCPUInfo(c *gin.Context) {
	percentages, err := cpu.Percent(0, false)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, CPUInfo{Usage: percentages[0]})
}

func getMemoryInfo(c *gin.Context) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, MemoryInfo{
		Total:       vmStat.Total,
		Used:        vmStat.Used,
		Free:        vmStat.Free,
		UsedPercent: vmStat.UsedPercent,
	})
}

func getDiskInfo(c *gin.Context) {
	diskStat, err := disk.Usage("/")
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, DiskInfo{
		Total:       diskStat.Total,
		Used:        diskStat.Used,
		Free:        diskStat.Free,
		UsedPercent: diskStat.UsedPercent,
		Path:        diskStat.Path,
	})
}
