import React from 'react';
import { TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react';

const KPICards = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kpis = [
    {
      title: 'Total Profit',
      value: formatCurrency(data.totalProfit),
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Efficiency Score',
      value: `${data.efficiencyScore}%`,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'On-time Deliveries',
      value: `${data.onTimeDeliveries}/${data.totalOrders}`,
      icon: Clock,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900'
    },
    {
      title: 'Late Deliveries',
      value: `${data.lateDeliveries}/${data.totalOrders}`,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`${kpi.bgColor} rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </p>
                <p className={`text-3xl font-bold ${kpi.textColor}`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-white shadow-sm`}>
                <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;