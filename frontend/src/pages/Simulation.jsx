import React, { useState } from 'react';
import { simulationAPI } from '../api/simulationAPI';
import { Play, Clock, Users, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Simulation = () => {
  const [formData, setFormData] = useState({
    availableDrivers: 5,
    routeStartTime: '09:00',
    maxHoursPerDriverPerDay: 8
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'availableDrivers' || name === 'maxHoursPerDriverPerDay' 
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await simulationAPI.runSimulation(formData);
      setResults(response.data);
      toast.success('Simulation completed successfully!');
    } catch (error) {
      console.error('Simulation failed:', error);
      const message = error.response?.data?.message || 'Simulation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Delivery Simulation</h1>
        <p className="text-gray-600 mt-1">
          Configure and run delivery simulations to optimize your logistics operations
        </p>
      </div>

      {/* Simulation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Simulation Parameters</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Available Drivers
            </label>
            <input
              type="number"
              name="availableDrivers"
              min="1"
              max="50"
              value={formData.availableDrivers}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Number of drivers available for delivery (1-50)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Route Start Time
            </label>
            <input
              type="time"
              name="routeStartTime"
              value={formData.routeStartTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">When delivery routes begin</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Max Hours per Driver
            </label>
            <input
              type="number"
              name="maxHoursPerDriverPerDay"
              min="1"
              max="16"
              value={formData.maxHoursPerDriverPerDay}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum working hours per driver (1-16)</p>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Running Simulation...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Play className="h-5 w-5 mr-2" />
                  Run Simulation
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Simulation Results */}
      {results && (
        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Simulation Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Profit</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(results.totalProfit)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Efficiency Score</p>
                    <p className="text-2xl font-bold text-blue-700">{results.efficiencyScore}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">On-time Deliveries</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {results.onTimeDeliveries}/{results.totalOrders}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Late Deliveries</p>
                    <p className="text-2xl font-bold text-red-700">
                      {results.lateDeliveries}/{results.totalOrders}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Fuel Cost Breakdown */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Fuel Cost Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatCurrency(results.fuelCostBreakdown.totalFuelCost)}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Low Traffic:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatCurrency(results.fuelCostBreakdown.byTrafficLevel.Low)}
                  </span>
                </div>
                <div>
                  <span className="text-yellow-600">Medium Traffic:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatCurrency(results.fuelCostBreakdown.byTrafficLevel.Medium)}
                  </span>
                </div>
                <div>
                  <span className="text-red-600">High Traffic:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatCurrency(results.fuelCostBreakdown.byTrafficLevel.High)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Per Order Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Per Order Results</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penalties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.perOrderResults.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.isLate 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.isLate ? 'Late' : 'On Time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.deliveryTimeMinutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {order.penalties > 0 ? formatCurrency(order.penalties) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {order.bonus > 0 ? formatCurrency(order.bonus) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulation;