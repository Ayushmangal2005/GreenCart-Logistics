import React, { useState, useEffect } from 'react';
import { simulationAPI } from '../api/simulationAPI';
import KPICards from '../components/Charts/KPICards';
import DeliveryChart from '../components/Charts/DeliveryChart';
import FuelCostChart from '../components/Charts/FuelCostChart';
import SimulationHistory from '../components/Charts/SimulationHistory';
import { RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const historyResponse = await simulationAPI.getSimulationHistory(10);
      console.log('History response:', historyResponse);
      setSimulationHistory(historyResponse.data || []);

      // Use the latest simulation as dashboard data
      if (historyResponse.data && historyResponse.data.length > 0) {
        const latest = historyResponse.data[0];
        console.log('Latest simulation:', latest);
        console.log('Latest simulation results:', latest.results);
        console.log('Data structure:', {
          totalProfit: latest.results?.totalProfit,
          totalOrders: latest.results?.totalOrders,
          onTimeDeliveries: latest.results?.onTimeDeliveries,
          lateDeliveries: latest.results?.lateDeliveries,
          efficiencyScore: latest.results?.efficiencyScore
        });
        setDashboardData(latest.results);
      } else {
        console.log('No simulation history found');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Simulation Data</h3>
        <p className="text-gray-600 mb-6">
          Run your first simulation to see KPI data and analytics.
        </p>
        <button
          onClick={() => window.location.href = '/simulation'}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Run First Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your logistics operations and KPIs
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <KPICards data={dashboardData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
          <DeliveryChart data={dashboardData} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Cost Breakdown</h3>
          <FuelCostChart data={dashboardData} />
        </div>
      </div>

      {/* Simulation History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulations</h3>
        <SimulationHistory data={simulationHistory} />
      </div>
    </div>
  );
};

export default Dashboard;