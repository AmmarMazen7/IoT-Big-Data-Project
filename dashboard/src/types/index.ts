export interface AnalyticsData {
  _id: string;
  type: string;
  zone: string;
  avg_value: number;
  max_value: number;
  min_value: number;
  reading_count: number;
  computed_at: string;
}

export interface SensorData {
  _id?: string;
  sensor_id: string;
  type: 'traffic' | 'temperature' | 'aqi';
  zone: string;
  value: number;
  timestamp: string;
}

export interface StatusCounts {
  raw_sensors_count: number;
  analytics_count: number;
}