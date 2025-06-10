"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// Removed Image import as it's not used. Add back if a logo/image is planned.
import { Button } from "@/components/ui/button"; // Import the Button component

// Helper function to convert bytes to GB
const bytesToGB = (bytes: number | undefined): string => { // Added type for bytes
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) { // Enhanced check
    return '0.00';
  }
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
};

// Define interfaces for the metrics data
interface CPUData {
  usage: number;
}

interface MemoryData {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

interface DiskData {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  path: string;
}

export default function Home() {
  const [cpuData, setCpuData] = useState<CPUData | null>(null);
  const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
  const [diskData, setDiskData] = useState<DiskData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cpuRes = await fetch("http://localhost:8080/api/metrics/cpu");
        if (!cpuRes.ok) throw new Error(`Failed to fetch CPU data: ${cpuRes.status} ${cpuRes.statusText}`);
        const cpuJson = await cpuRes.json();
        setCpuData(cpuJson);

        const memoryRes = await fetch("http://localhost:8080/api/metrics/memory");
        if (!memoryRes.ok) throw new Error(`Failed to fetch Memory data: ${memoryRes.status} ${memoryRes.statusText}`);
        const memoryJson = await memoryRes.json();
        setMemoryData(memoryJson);

        const diskRes = await fetch("http://localhost:8080/api/metrics/disk");
        if (!diskRes.ok) throw new Error(`Failed to fetch Disk data: ${diskRes.status} ${diskRes.statusText}`);
        const diskJson = await diskRes.json();
        setDiskData(diskJson);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred. Ensure the backend is running.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    // Use theme variables for background and text
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      {/* Added pt-16 to account for fixed header, similar to dashboard */}
      <main className="flex flex-col items-center gap-8 w-full max-w-3xl pt-16">
        <header className="text-center">
          {/* Using a simpler, theme-friendly heading style */}
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">
            System Dashboard Insights
          </h1>
          <p className="mt-4 text-md sm:text-lg text-muted-foreground">
            Welcome to your system monitoring dashboard. Get live insights into CPU, memory, and disk usage.
          </p>
        </header>

        {loading && <p className="text-xl text-muted-foreground">Loading system metrics...</p>}
        {error && <p className="text-xl text-destructive text-center">Error: {error}</p>}

        {!loading && !error && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
            {/* CPU Card - Using theme variables for card styling */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3">CPU Usage</h2>
              {cpuData ? (
                <p className="text-2xl sm:text-3xl font-bold">{cpuData.usage.toFixed(2)}%</p>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>

            {/* Memory Card - Using theme variables */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3">Memory Usage</h2>
              {memoryData ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold">{memoryData.usedPercent.toFixed(2)}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {bytesToGB(memoryData.used)}GB / {bytesToGB(memoryData.total)}GB
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>

            {/* Disk Card - Using theme variables */}
            <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3">Disk Usage (/)</h2>
              {diskData ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold">{diskData.usedPercent.toFixed(2)}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {bytesToGB(diskData.used)}GB / {bytesToGB(diskData.total)}GB
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 sm:mt-10">
          {/* Using the Button component for consistent styling */}
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/dashboard">View Full Dashboard</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full max-w-3xl mt-12 text-center text-muted-foreground text-sm pb-8">
        <p>System Insights Dashboard &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
