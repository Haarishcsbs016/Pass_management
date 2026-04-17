import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { passAPI } from '../services/api';
import {
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bus,
} from 'lucide-react';

const Dashboard = () => {
  const { data: passesData, isLoading } = useQuery(
    'myPasses',
    () => passAPI.getMyPasses({ limit: 5 }),
    {
      select: (response) => response.data.data,
    }
  );

  const passes = passesData?.passes || [];
  const pagination = passesData?.pagination || {};

  // Calculate statistics
  const stats = {
    total: passes.length,
    pending: passes.filter((p) => p.status === 'pending').length,
    approved: passes.filter((p) => p.status === 'approved').length,
    rejected: passes.filter((p) => p.status === 'rejected').length,
    paymentPending: passes.filter((p) => (p.paymentStatus || 'unpaid') === 'pending').length,
    paymentPaid: passes.filter((p) => p.paymentStatus === 'paid').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

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
        return `${baseClasses} status-expired`;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Transport Pass System</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your transport passes and applications from here
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/apply-pass"
          className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Apply for Pass</p>
              <p className="text-lg font-semibold text-gray-900">New Application</p>
            </div>
          </div>
        </Link>

        <Link
          to="/my-passes"
          className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Passes</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total} Passes</p>
            </div>
          </div>
        </Link>

        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">{stats.pending} Applications</p>
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-lg font-semibold text-gray-900">{stats.approved} Passes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link
                to="/my-passes"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>

            {passes.length === 0 ? (
              <div className="text-center py-8">
                <Bus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by applying for your first transport pass.
                </p>
                <div className="mt-6">
                  <Link
                    to="/apply-pass"
                    className="btn btn-primary"
                  >
                    Apply for Pass
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Pass Details</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {passes.map((pass) => (
                      <tr key={pass._id} className="hover:bg-gray-50">
                        <td>
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {pass.source.charAt(0).toUpperCase() + pass.source.slice(1)} →{' '}
                                {pass.destination.charAt(0).toUpperCase() + pass.destination.slice(1)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pass.passNumber && `Pass #${pass.passNumber}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-gray-900">
                          {pass.duration === '1-month' && '1 Month'}
                          {pass.duration === '3-months' && '3 Months'}
                          {pass.duration === '6-months' && '6 Months'}
                          {pass.duration === '1-year' && '1 Year'}
                        </td>
                        <td className="text-sm text-gray-900">₹{pass.price}</td>
                        <td>
                          <div className="flex items-center">
                            {getStatusIcon(pass.status)}
                            <span className={`ml-2 ${getStatusBadge(pass.status)}`}>
                              {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                            </span>
                          </div>
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

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Application Statistics</h2>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="text-lg font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="text-lg font-semibold text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-lg font-semibold text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Pending</span>
                <span className="text-lg font-semibold text-blue-600">{stats.paymentPending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Paid</span>
                <span className="text-lg font-semibold text-green-600">{stats.paymentPaid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-lg font-semibold text-red-600">{stats.rejected}</span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900">Quick Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Upload clear documents for faster approval</li>
              <li>• Check your application status regularly</li>
              <li>• Download approved passes immediately</li>
              <li>• Renew passes before expiry date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
