import React from 'react';
import { format } from 'date-fns';
import { Clock, TrendingUp, Package } from 'lucide-react';

const SimulationHistory = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No simulation history available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {data.map((simulation, index) => (
        <div
          key={simulation._id || index}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Simulation #{index + 1}
                </h4>
                <p className="text-sm text-gray-500">
                  {format(new Date(simulation.timestamp), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(simulation.results?.totalProfit || 0)}
              </p>
              <p className="text-xs text-gray-500">Total Profit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {simulation.results?.totalOrders || 0}
                </p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {simulation.results?.efficiencyScore || 0}%
                </p>
                <p className="text-xs text-gray-500">Efficiency</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {simulation.inputParameters?.availableDrivers || 0}
                </p>
                <p className="text-xs text-gray-500">Drivers Used</p>
              </div>
            </div>
          </div>

          {/* Parameters Summary */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">
                Start: {simulation.inputParameters?.routeStartTime || 'N/A'}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                Max Hours: {simulation.inputParameters?.maxHoursPerDriverPerDay || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimulationHistory;