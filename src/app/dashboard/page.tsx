"use client";

import React, { useEffect, useState } from "react";

interface K8sData {
  nodes: string[];
  pods: Array<{ name: string; node: string }>;
  nodesPods: Record<string, string[]>;
}

const Dashboard: React.FC<{ data: K8sData }> = ({ data }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kubernetes Cluster Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cluster Nodes ({data.nodes.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.nodes.map((node) => (
            <div key={node} className="p-4 border rounded-md bg-card">
              <h3 className="font-medium">{node}</h3>
              <p className="text-sm text-muted-foreground">
                {data.nodesPods[node]?.length || 0} pods
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">Nodes and Pods</h2>
        {Object.entries(data.nodesPods).map(([node, pods]) => (
          <div key={node} className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Node: {node}</h3>
            <ul className="space-y-1">
              {pods.map((pod) => (
                <li key={pod} className="text-sm p-2 bg-muted/50 rounded">
                  {pod}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const Page = () => {
  const [data, setData] = useState<K8sData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/k8sinfo");
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log("Fetched data:", json);
        
        if (!json.nodesPods) {
          throw new Error("Invalid data format: missing nodesPods");
        }
        
        setData(json);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-lg">Loading Kubernetes data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
          <h2 className="text-lg font-medium text-destructive mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Make sure the backend server is running at http://localhost:8080
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p>No data available</p>
      </div>
    );
  }

  return <Dashboard data={data} />;
};

export default Page;
