import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { passAPI } from '../../services/api';
import { format } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: statsData, isLoading } = useQuery(
    'adminStatistics',
    passAPI.getStatistics,
    {
      select: (response) => response.data.data,
    }
  );

  const stats = statsData || {};

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading reports...</div>;
  }

  // Calculate statistics
  const statusStats = stats.statusStats || [];
  const totalApplications = stats.totalApplications || 0;
  const monthlyApplications = stats.monthlyApplications || [];

  const getStatusCount = (status) => {
    return statusStats.find(s => s._id === status)?.count || 0;
  };

  const getTotalRevenue = () => {
    return statusStats.reduce((total, stat) => total + (stat.totalRevenue || 0), 0);
  };

  const exportToCSV = () => {
    // In a real implementation, this would generate and download a CSV file
    const csvContent = "data:text/csv;charset=utf-8,Status,Count,Revenue\n" +
      statusStats.map(stat => `${stat._id},${stat.count},${stat.totalRevenue || 0}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transport_pass_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            View detailed reports and system analytics
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn btn-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field text-sm py-1"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field text-sm py-1"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('approved')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalApplications > 0 ? Math.round((getStatusCount('approved') / totalApplications) * 100) : 0}% approval rate
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('pending')}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{getTotalRevenue()}</p>
              <p className="text-xs text-gray-500 mt-1">From approved passes</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Application Status Breakdown</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {statusStats.map((stat) => {
              const percentage = totalApplications > 0 ? (stat.count / totalApplications) * 100 : 0;
              const getStatusColor = (status) => {
                switch (status) {
                  case 'pending': return 'bg-yellow-500';
                  case 'approved': return 'bg-green-500';
                  case 'rejected': return 'bg-red-500';
                  default: return 'bg-gray-500';
                }
              };

              return (
                <div key={stat._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {stat._id}
                    </span>
                    <span className="text-sm text-gray-900">
                      {stat.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(stat._id)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Application Trends</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyApplications.slice(0, 6).map((month, index) => {
              const maxCount = Math.max(...monthlyApplications.map(m => m.count));
              const percentage = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
              
              return (
                <div key={`${month._id.year}-${month._id.month}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm text-gray-900">{month.count} applications</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Revenue</th>
                <th>Average Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statusStats.map((stat) => (
                <tr key={stat._id}>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      stat._id === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      stat._id === 'approved' ? 'bg-green-100 text-green-800' :
                      stat._id === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                    </span>
                  </td>
                  <td className="text-sm text-gray-900">{stat.count}</td>
                  <td className="text-sm text-gray-900">
                    {totalApplications > 0 ? ((stat.count / totalApplications) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="text-sm text-gray-900">₹{stat.totalRevenue || 0}</td>
                  <td className="text-sm text-gray-900">
                    ₹{stat.count > 0 ? ((stat.totalRevenue || 0) / stat.count).toFixed(2) : 0}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="text-sm text-gray-900">Total</td>
                <td className="text-sm text-gray-900">{totalApplications}</td>
                <td className="text-sm text-gray-900">100%</td>
                <td className="text-sm text-gray-900">₹{getTotalRevenue()}</td>
                <td className="text-sm text-gray-900">
                  ₹{totalApplications > 0 ? (getTotalRevenue() / totalApplications).toFixed(2) : 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
