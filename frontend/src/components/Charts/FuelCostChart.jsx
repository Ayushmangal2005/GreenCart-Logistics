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

const FuelCostChart = ({ data }) => {
  if (!data || !data.fuelCostBreakdown) return null;

  const { byTrafficLevel } = data.fuelCostBreakdown;

  const pieData = [
    {
      name: 'Low Traffic',
      value: byTrafficLevel.Low || 0,
      color: '#22c55e'
    },
    {
      name: 'Medium Traffic',
      value: byTrafficLevel.Medium || 0,
      color: '#f59e0b'
    },
    {
      name: 'High Traffic',
      value: byTrafficLevel.High || 0,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const barData = [
    {
      name: 'Low',
      cost: byTrafficLevel.Low || 0,
      fill: '#22c55e'
    },
    {
      name: 'Medium',
      cost: byTrafficLevel.Medium || 0,
      fill: '#f59e0b'
    },
    {
      name: 'High',
      cost: byTrafficLevel.High || 0,
      fill: '#ef4444'
    }
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label} Traffic`}</p>
          <p className="text-sm text-gray-600">
            {`Cost: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Total Cost Summary */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total Fuel Cost</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(data.fuelCostBreakdown.totalFuelCost)}
        </p>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Cost by Traffic Level</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Cost Breakdown</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FuelCostChart;