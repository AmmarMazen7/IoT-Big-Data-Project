import React from 'react';
import { Bar } from 'react-chartjs-2';
import { AnalyticsData } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface IoTChartProps {
  data: AnalyticsData[];
  type: string;
  title: string;
  yAxisLabel: string;
}

export const IoTChart: React.FC<IoTChartProps> = ({ data, type, title, yAxisLabel }) => {
  const filteredData = data.filter(d => d.type === type);
  
  // Extract unique zones
  const zones = Array.from(new Set(filteredData.map(d => d.zone)));

  const chartData = {
    labels: zones,
    datasets: [
      {
        label: 'Average',
        data: zones.map(zone => {
          const zoneData = filteredData.find(d => d.zone === zone);
          return zoneData ? zoneData.avg_value : 0;
        }),
        backgroundColor: chartColors.primary,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Maximum',
        data: zones.map(zone => {
          const zoneData = filteredData.find(d => d.zone === zone);
          return zoneData ? zoneData.max_value : 0;
        }),
        backgroundColor: chartColors.secondary,
        borderRadius: 8,
        borderSkipped: false,
      }
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: title,
        color: '#F3F4F6',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: yAxisLabel,
          color: '#D1D5DB',
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};
