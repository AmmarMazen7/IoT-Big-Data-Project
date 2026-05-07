import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardCard } from './DashboardCard';
import { IoTChart } from './charts/IoTChart';
import { Activity, Thermometer, Wind, Radio, Loader2, AlertTriangle } from 'lucide-react';
import { AnalyticsData, SensorData } from '../types';
import { SensorFeed } from './SensorFeed';
import { ProjectInsights } from './ProjectInsights';

// Add a simple logger utility at the top if not imported
function log(level: 'info' | 'warn' | 'error' | 'debug', ...args: any[]) {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `[${timestamp}] [${level.toUpperCase()}]`,
    ...args
  );
}

export const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const analyticsRef = React.useRef<AnalyticsData[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [rawSensorsCount, setRawSensorsCount] = useState<number | null>(null);
  const [analyticsCount, setAnalyticsCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [showPopUp, setShowPopUp] = useState<string | null>(null);

  useEffect(() => {
    const socket = apiService.connectSocket(
      // onAnalyticsUpdate
      (newAnalyticsData: AnalyticsData) => {
        setAnalyticsData((prevData) => {
          const existingIndex = prevData.findIndex(
            (item) => item.type === newAnalyticsData.type && item.zone === newAnalyticsData.zone
          );
          let updatedData;
          if (existingIndex > -1) {
            updatedData = [...prevData];
            updatedData[existingIndex] = newAnalyticsData;
            setShowPopUp(`Analytics updated for ${newAnalyticsData.zone}!`);
            setTimeout(() => setShowPopUp(null), 3000);
          } else {
            updatedData = [...prevData, newAnalyticsData];
            setShowPopUp('New analytics data!');
            setTimeout(() => setShowPopUp(null), 3000);
          }
          analyticsRef.current = updatedData;
          return updatedData;
        });
      },
      // onSensorUpdate
      (newSensorData: SensorData) => {
        setSensorData((prevData) => {
            const newList = [newSensorData, ...prevData].slice(0, 100); // keep last 100
            return newList;
        });
        setRawSensorsCount(prev => (prev !== null ? prev + 1 : 1));
      },
      // onInitialSensors
      (initialSensors: SensorData[]) => {
        setSensorData(initialSensors);
        log('info', 'Initial Sensors Data Loaded via WebSocket:', initialSensors);
      },
      // onInitialAnalytics
      (initialAnalytics: AnalyticsData[]) => {
        log('info', "Initial Analytics Data Loaded via WebSocket:", initialAnalytics);
        
        // Check if this is a refresh (we already had data)
        if (analyticsRef.current.length > 0) {
          setShowPopUp("Batch Analytics Refreshed!");
          setTimeout(() => setShowPopUp(null), 4000);
        }
        
        setAnalyticsData(initialAnalytics);
        analyticsRef.current = initialAnalytics;
        setLoading(false);
      },
      // onStatusCounts
      (counts: { raw_sensors_count: number; analytics_count: number }) => {
        setRawSensorsCount(counts.raw_sensors_count);
        setAnalyticsCount(counts.analytics_count);
        log('info', "Status Counts Updated via WebSocket:", counts);
      },
      // onDataDelete
      (id: string) => {
        log('info', "Document with ID deleted:", id);
      }
    );

    return () => {
      apiService.disconnectSocket();
    };
  }, []);

  // Calculate summary statistics
  const latestTemp = sensorData.find(s => s.type === 'temperature')?.value || 0;
  const latestAQI = sensorData.find(s => s.type === 'aqi')?.value || 0;
  const latestTraffic = sensorData.find(s => s.type === 'traffic')?.value || 0;
  const totalReadings = rawSensorsCount || sensorData.length;

  return (
    <div className="min-h-screen text-slate-200 p-6 md:p-10">
      {/* Pop-up notification */}
      {showPopUp && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-bounce">
          {showPopUp}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 tracking-tight">
              Smart City Command Center
            </h1>
            <p className="text-slate-400 font-medium">Real-time IoT Telemetry & Advanced Spark Analytics</p>
          </div>
          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">Live Feed Active</span>
          </div>
        </div>

        {/* Project Presentation Section */}
        <ProjectInsights />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/90 to-red-600/90 rounded-2xl p-6 text-white shadow-xl shadow-orange-900/20 border border-orange-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-orange-100/80 font-medium text-sm uppercase tracking-wider mb-1">Latest Temperature</p>
                <p className="text-4xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin w-8 h-8" /> : `${latestTemp} °C`}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Thermometer className="w-8 h-8 text-orange-50" />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/90 to-blue-600/90 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 border border-cyan-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-cyan-100/80 font-medium text-sm uppercase tracking-wider mb-1">Latest Traffic</p>
                <p className="text-4xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin w-8 h-8" /> : `${latestTraffic} c/m`}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Activity className="w-8 h-8 text-cyan-50" />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/90 to-teal-600/90 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20 border border-emerald-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-emerald-100/80 font-medium text-sm uppercase tracking-wider mb-1">Latest AQI</p>
                <p className="text-4xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin w-8 h-8" /> : latestAQI}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Wind className="w-8 h-8 text-emerald-50" />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/90 to-indigo-600/90 rounded-2xl p-6 text-white shadow-xl shadow-purple-900/20 border border-purple-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-purple-100/80 font-medium text-sm uppercase tracking-wider mb-1">Total Records</p>
                <p className="text-4xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin w-8 h-8" /> : totalReadings.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Radio className="w-8 h-8 text-purple-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="City Traffic Overview"
            subtitle="Average and maximum traffic by zone (from Spark Analytics)"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading analytics data...</div>
            ) : analyticsData.filter(d => d.type === 'traffic').length > 0 ? (
              <IoTChart data={analyticsData} type="traffic" title="Traffic Congestion" yAxisLabel="Cars / min" />
            ) : (
              <div className="text-center text-gray-500 py-10">No traffic analytics available yet. Run Spark job.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Temperature Distribution"
            subtitle="Average and maximum temperature by zone (from Spark Analytics)"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading average merge time data...</div>
            ) : analyticsData.filter(d => d.type === 'temperature').length > 0 ? (
              <IoTChart data={analyticsData} type="temperature" title="City Heatmap" yAxisLabel="Temperature °C" />
            ) : (
              <div className="text-center text-gray-500 py-10">No temperature analytics available yet. Run Spark job.</div>
            )}
          </DashboardCard>
        </div>

        {/* Live Sensor Feed */}
        <DashboardCard
          title="Live Sensor Ticker"
          subtitle={`Real-time telemetry stream directly from Kafka`}
          loading={loading}
          error={null}
          onRetry={null}
        >
          {loading ? (
            <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Waiting for sensor updates...</div>
          ) : sensorData.length > 0 ? (
            <SensorFeed data={sensorData.slice(0, 15)} />
          ) : (
            <div className="text-center text-gray-500 py-10">No live telemetry available yet. Waiting for new Kafka events.</div>
          )}
        </DashboardCard>

        {/* Display counts */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Total Raw Sensors stored: {rawSensorsCount !== null ? rawSensorsCount : <Loader2 className="animate-spin inline-block ml-2 w-4 h-4" />}</p>
          <p>Total Analytics Records: {analyticsCount !== null ? analyticsCount : <Loader2 className="animate-spin inline-block ml-2 w-4 h-4" />}</p>
        </div>

      </div>
    </div>
  );
};