import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler
);

export const chartColors = {
  primary: '#0ea5e9', // cyan-500
  secondary: '#8b5cf6', // violet-500
  accent: '#f59e0b',
  danger: '#e11d48', // rose-600
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: {
          family: "'Outfit', sans-serif",
          size: 13,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#F8FAFC',
      bodyColor: '#CBD5E1',
      borderColor: 'rgba(51, 65, 85, 0.5)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#64748b',
        font: { family: "'Outfit', sans-serif" }
      },
      grid: {
        display: false, // Cleaner look without vertical grid lines
      },
      border: { display: false },
    },
    y: {
      ticks: {
        color: '#64748b',
        font: { family: "'Outfit', sans-serif" }
      },
      grid: {
        color: 'rgba(51, 65, 85, 0.3)', // Subtle horizontal lines
      },
      border: { display: false, dash: [4, 4] },
    },
  },
};