"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button"; // Assuming a Button component is available

// Define interfaces for the metrics data to match backend response
interface MemoryInfo {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

interface DiskInfo {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  path: string;
}

interface CPUData {
  usage: number;
}

const MAX_HISTORY_LENGTH = 1000; // Increased for time range filters
const POLLING_INTERVAL_MS = 5000; // 5 seconds

// Helper function to convert bytes to GB for display
const bytesToGB = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0.00';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
};

// CSV Export Function
const exportToCSV = (data: { name: string; value: number }[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }
  const headers = Object.keys(data[0]).join(",");
  const csvRows = data.map(row => Object.values(row).join(","));
  const csvString = `${headers}\n${csvRows.join("\n")}`;

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};


const DashboardPage = () => {
  // State variables for current metrics
  const [cpuUsage, setCpuUsage] = useState<number | null>(null);
  const [ramUsage, setRamUsage] = useState<MemoryInfo | null>(null);
  const [diskUsage, setDiskUsage] = useState<DiskInfo | null>(null);

  // State variables for historical data for charts
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [ramHistory, setRamHistory] = useState<number[]>([]);
  const [diskHistory, setDiskHistory] = useState<number[]>([]);

  // Time range filter state
  const [timeRange, setTimeRange] = useState<'5m' | '1h' | 'all'>('all');

  // Loading and error states for each metric
  const [loadingStates, setLoadingStates] = useState({
    cpu: true,
    ram: true,
    disk: true,
  });
  const [errorStates, setErrorStates] = useState<{ cpu: string | null; ram: string | null; disk: string | null }>({
    cpu: null,
    ram: null,
    disk: null,
  });

  const fetchMetrics = useCallback(async () => {
    const updateHistory = (prevHistory: number[], newValue: number) => {
      const newHistory = [...prevHistory, newValue];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
      }
      return newHistory;
    };

    // Fetch CPU
    try {
      setLoadingStates(prev => ({ ...prev, cpu: true }));
      const cpuRes = await fetch("http://localhost:8080/api/metrics/cpu");
      if (!cpuRes.ok) throw new Error(`CPU: ${cpuRes.status} ${cpuRes.statusText}`);
      const cpuData: CPUData = await cpuRes.json();
      setCpuUsage(cpuData.usage);
      setCpuHistory(prev => updateHistory(prev, cpuData.usage));
      setErrorStates(prev => ({ ...prev, cpu: null }));
    } catch (e) {
      setErrorStates(prev => ({ ...prev, cpu: e instanceof Error ? e.message : String(e) }));
    } finally {
      setLoadingStates(prev => ({ ...prev, cpu: false }));
    }

    // Fetch RAM
    try {
      setLoadingStates(prev => ({ ...prev, ram: true }));
      const ramRes = await fetch("http://localhost:8080/api/metrics/memory");
      if (!ramRes.ok) throw new Error(`RAM: ${ramRes.status} ${ramRes.statusText}`);
      const ramData: MemoryInfo = await ramRes.json();
      setRamUsage(ramData);
      setRamHistory(prev => updateHistory(prev, ramData.usedPercent));
      setErrorStates(prev => ({ ...prev, ram: null }));
    } catch (e) {
      setErrorStates(prev => ({ ...prev, ram: e instanceof Error ? e.message : String(e) }));
    } finally {
      setLoadingStates(prev => ({ ...prev, ram: false }));
    }

    // Fetch Disk
    try {
      setLoadingStates(prev => ({ ...prev, disk: true }));
      const diskRes = await fetch("http://localhost:8080/api/metrics/disk");
      if (!diskRes.ok) throw new Error(`Disk: ${diskRes.status} ${diskRes.statusText}`);
      const diskData: DiskInfo = await diskRes.json();
      setDiskUsage(diskData);
      setDiskHistory(prev => updateHistory(prev, diskData.usedPercent));
      setErrorStates(prev => ({ ...prev, disk: null }));
    } catch (e) {
      setErrorStates(prev => ({ ...prev, disk: e instanceof Error ? e.message : String(e) }));
    } finally {
      setLoadingStates(prev => ({ ...prev, disk: false }));
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, POLLING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchMetrics]);

  const getFilteredHistory = (history: number[]) => {
    if (timeRange === 'all') return history;
    const pointsPer5Min = (5 * 60 * 1000) / POLLING_INTERVAL_MS; // 60 points
    const pointsPer1Hour = (60 * 60 * 1000) / POLLING_INTERVAL_MS; // 720 points

    if (timeRange === '5m') return history.slice(-pointsPer5Min);
    if (timeRange === '1h') return history.slice(-pointsPer1Hour);
    return history;
  };

  const formatChartData = (history: number[], dataKey: string) => {
    const filtered = getFilteredHistory(history);
    return filtered.map((value, index) => ({ name: `Pt ${index + 1}`, [dataKey]: value.toFixed(2) }));
  };

  const handleExport = (history: number[], dataKey: string, filename: string) => {
    const dataToExport = getFilteredHistory(history).map((value, index) => ({
      time_index: index + 1,
      [dataKey]: value.toFixed(2)
    }));
    exportToCSV(dataToExport, filename);
  };


  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen font-[family-name:var(--font-geist-sans)]">
      {/* Header Adjust: Add some margin-top to account for fixed header if not already handled by a layout component */}
      <div className="pt-20"> {/* Increased padding top for more space below fixed header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">
            {/* Removed gradient for better theme compatibility, can be added back with CSS vars */}
            System Metrics Dashboard
          </h1>
        </header>

        {/* Time Range Filters */}
        <div className="flex justify-center gap-2 mb-6 sm:mb-8">
          {(['5m', '1h', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs sm:text-sm"
            >
              {range === '5m' ? 'Last 5 Min' : range === '1h' ? 'Last 1 Hour' : 'All Time'}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* CPU Card */}
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg border">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-primary">CPU Usage</h2>
            </div>
            {loadingStates.cpu && !cpuUsage && <p className="text-muted-foreground text-2xl sm:text-3xl font-bold">Loading...</p>}
            {errorStates.cpu && <p className="text-destructive text-sm">Error: {errorStates.cpu}</p>}
            {cpuUsage !== null && !errorStates.cpu && (
              <p className="text-2xl sm:text-3xl font-bold">{cpuUsage.toFixed(2)}%</p>
            )}
          </div>

          {/* RAM Card */}
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg border">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3">RAM Usage</h2>
            {loadingStates.ram && !ramUsage && <p className="text-muted-foreground text-2xl sm:text-3xl font-bold">Loading...</p>}
            {errorStates.ram && <p className="text-destructive text-sm">Error: {errorStates.ram}</p>}
            {ramUsage !== null && !errorStates.ram && (
              <>
                <p className="text-2xl sm:text-3xl font-bold">{ramUsage.usedPercent.toFixed(2)}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {bytesToGB(ramUsage.used)}GB / {bytesToGB(ramUsage.total)}GB
                </p>
              </>
            )}
          </div>

          {/* Disk Card */}
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg border">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3">Disk Usage (/)</h2>
            {loadingStates.disk && !diskUsage && <p className="text-muted-foreground text-2xl sm:text-3xl font-bold">Loading...</p>}
            {errorStates.disk && <p className="text-destructive text-sm">Error: {errorStates.disk}</p>}
            {diskUsage !== null && !errorStates.disk && (
              <>
                <p className="text-2xl sm:text-3xl font-bold">{diskUsage.usedPercent.toFixed(2)}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {bytesToGB(diskUsage.used)}GB / {bytesToGB(diskUsage.total)}GB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[
            { title: "CPU Usage Over Time", history: cpuHistory, dataKey: "cpu", color: "hsl(var(--chart-1))", error: errorStates.cpu, loading: loadingStates.cpu },
            { title: "RAM Usage Over Time", history: ramHistory, dataKey: "ram", color: "hsl(var(--chart-2))", error: errorStates.ram, loading: loadingStates.ram },
            { title: "Disk Usage (%) Over Time", history: diskHistory, dataKey: "disk", color: "hsl(var(--chart-3))", error: errorStates.disk, loading: loadingStates.disk, fullWidth: true },
          ].map(chart => (
            <div key={chart.dataKey} className={`bg-card p-4 sm:p-6 rounded-lg shadow-lg border ${chart.fullWidth ? 'lg:col-span-2' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary">{chart.title}</h3>
                <Button variant="outline" size="sm" onClick={() => handleExport(chart.history, chart.dataKey, `${chart.dataKey}_usage_history.csv`)}>
                  Export CSV
                </Button>
              </div>
              {(chart.loading && getFilteredHistory(chart.history).length === 0) && <p className="text-muted-foreground text-center h-[300px] flex items-center justify-center">Loading chart data...</p>}
              {(chart.error && getFilteredHistory(chart.history).length === 0) && <p className="text-destructive text-center h-[300px] flex items-center justify-center">Error: {chart.error}</p>}
              {(!chart.loading && getFilteredHistory(chart.history).length === 0 && !chart.error) && <p className="text-muted-foreground text-center h-[300px] flex items-center justify-center">No data for selected range.</p>}

              {getFilteredHistory(chart.history).length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formatChartData(chart.history, chart.dataKey)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval="auto" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                      itemStyle={{ color: chart.color }}
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey={chart.dataKey} name={chart.title.replace(" Over Time", "")} stroke={chart.color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
