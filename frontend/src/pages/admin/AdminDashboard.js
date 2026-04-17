import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { passAPI } from '../../services/api';
import {
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Bus,
  AlertCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'adminStatistics',
    passAPI.getStatistics,
    {
      select: (response) => response.data.data,
    }
  );

  const { data: passesData, isLoading: passesLoading } = useQuery(
    'recentPasses',
    () => passAPI.getAllPasses({ limit: 5 }),
    {
      select: (response) => response.data.data,
    }
  );

  const stats = statsData || {};
  const recentPasses = passesData?.passes || [];

  const getStatusBadge = (status) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'pending':
        return `${baseClasses} status-pending`;
      case 'approved':
        return `${baseClasses} status-approved`;
      case 'rejected':
        return `${baseClasses} status-rejected`;
      default:
        return baseClasses;
    }
  };

  const getStatCard = (title, value, icon, color, change) => (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (statsLoading || passesLoading) {
    return <div className="flex justify-center py-8">Loading dashboard...</div>;
  }

  // Calculate stats from statusStats array
  const statusStats = stats.statusStats || [];
  const totalApplications = stats.totalApplications || 0;
  const pendingCount = statusStats.find(s => s._id === 'pending')?.count || 0;
  const approvedCount = statusStats.find(s => s._id === 'approved')?.count || 0;
  const rejectedCount = statusStats.find(s => s._id === 'rejected')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage transport pass applications and system overview
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatCard(
          'Total Applications',
          totalApplications,
          <Users className="h-6 w-6 text-blue-600" />,
          'border-blue-500'
        )}
        {getStatCard(
          'Pending Review',
          pendingCount,
          <Clock className="h-6 w-6 text-yellow-600" />,
          'border-yellow-500'
        )}
        {getStatCard(
          'Approved',
          approvedCount,
          <CheckCircle className="h-6 w-6 text-green-600" />,
          'border-green-500'
        )}
        {getStatCard(
          'Rejected',
          rejectedCount,
          <XCircle className="h-6 w-6 text-red-600" />,
          'border-red-500'
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link
                to="/admin/passes"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>

            {recentPasses.length === 0 ? (
              <div className="text-center py-8">
                <Bus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New pass applications will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Route</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPasses.map((pass) => (
                      <tr key={pass._id} className="hover:bg-gray-50">
                        <td>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pass.userId?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pass.userId?.email}
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-gray-900">
                          {pass.source.charAt(0).toUpperCase() + pass.source.slice(1)} →{' '}
                          {pass.destination.charAt(0).toUpperCase() + pass.destination.slice(1)}
                        </td>
                        <td className="text-sm text-gray-900">
                          {pass.duration === '1-month' && '1 Month'}
                          {pass.duration === '3-months' && '3 Months'}
                          {pass.duration === '6-months' && '6 Months'}
                          {pass.duration === '1-year' && '1 Year'}
                        </td>
                        <td className="text-sm font-medium text-gray-900">₹{pass.price}</td>
                        <td>
                          <span className={getStatusBadge(pass.status)}>
                            {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {new Date(pass.applicationDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link
                to="/admin/passes"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Review Applications</span>
                </div>
                {pendingCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin/routes"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MapPin className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-900">Manage Routes</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-purple-900">View Reports</span>
              </Link>
            </div>
          </div>

          {/* System Alerts */}
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="card-header border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-900 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                System Alerts
              </h3>
            </div>
            <div className="space-y-2">
              {pendingCount > 0 && (
                <div className="text-sm text-yellow-800">
                  • {pendingCount} applications pending review
                </div>
              )}
              <div className="text-sm text-yellow-800">
                • System running normally
              </div>
              <div className="text-sm text-yellow-800">
                • Database backup completed
              </div>
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-gray-900">Monthly Overview</h3>
            </div>
            <div className="space-y-3">
              {stats.monthlyApplications?.slice(0, 3).map((month, index) => (
                <div key={`${month._id.year}-${month._id.month}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{month.count} applications</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
