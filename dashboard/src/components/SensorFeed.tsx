import React from 'react';
import { SensorData } from '../types';
import { Activity, Thermometer, Wind, AlertTriangle, MapPin } from 'lucide-react';

interface SensorFeedProps {
  data: SensorData[];
}

export const SensorFeed: React.FC<SensorFeedProps> = ({ data }) => {

  const getIcon = (type: string) => {
    switch (type) {
      case 'traffic': return <Activity className="w-5 h-5 text-blue-400" />;
      case 'temperature': return <Thermometer className="w-5 h-5 text-orange-400" />;
      case 'aqi': return <Wind className="w-5 h-5 text-green-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const isAnomaly = (sensor: SensorData) => {
    if (sensor.type === 'traffic' && sensor.value > 150) return true;
    if (sensor.type === 'aqi' && sensor.value > 150) return true;
    if (sensor.type === 'temperature' && (sensor.value > 38 || sensor.value < 0)) return true;
    return false;
  };

  const formatValue = (sensor: SensorData) => {
    switch (sensor.type) {
      case 'traffic': return `${sensor.value} cars/min`;
      case 'temperature': return `${sensor.value} °C`;
      case 'aqi': return `${sensor.value} AQI`;
      default: return sensor.value;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {data.map((sensor, idx) => {
        const anomaly = isAnomaly(sensor);
        return (
          <div
            key={sensor._id || idx}
            className={`rounded-xl p-4 transition-all duration-500 ease-out border backdrop-blur-sm ${
              anomaly 
                ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/40 hover:border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.1)]' 
                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600'
            } animate-in slide-in-from-right-4 fade-in`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {getIcon(sensor.type)}
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    {sensor.sensor_id}
                    {anomaly && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sensor.zone}
                    </span>
                    <span className="flex items-center gap-1">
                      {formatDate(sensor.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded text-sm font-bold ${
                    anomaly ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'
                  }`}
                >
                  {formatValue(sensor)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
