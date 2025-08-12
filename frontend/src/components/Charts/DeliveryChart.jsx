import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const DeliveryChart = ({ data }) => {
  if (!data) return null;

  const pieData = [
    {
      name: 'On-time Deliveries',
      value: data.onTimeDeliveries,
      color: '#10b981'
    },
    {
      name: 'Late Deliveries', 
      value: data.lateDeliveries,
      color: '#ef4444'
    }
  ];

  const barData = [
    {
      name: 'On-time',
      deliveries: data.onTimeDeliveries,
      fill: '#10b981'
    },
    {
      name: 'Late',
      deliveries: data.lateDeliveries,
      fill: '#ef4444'
    }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Delivery Status Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Delivery Performance</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="deliveries" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeliveryChart;