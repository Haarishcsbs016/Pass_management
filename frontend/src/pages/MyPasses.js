import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { passAPI } from '../services/api';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  MapPin,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyPasses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: passesData, isLoading, refetch } = useQuery(
    ['myPasses', currentPage, statusFilter],
    () => passAPI.getMyPasses({ 
      page: currentPage, 
      limit: 10,
      ...(statusFilter && { status: statusFilter })
    }),
    {
      select: (response) => response.data.data,
      keepPreviousData: true,
    }
  );

  const passes = passesData?.passes || [];
  const pagination = passesData?.pagination || {};

  const paymentSummary = useMemo(() => {
    return passes.reduce(
      (acc, pass) => {
        const status = pass.paymentStatus || 'unpaid';
        if (status === 'paid') acc.paid += 1;
        if (status === 'pending') acc.pending += 1;
        if (status === 'failed') acc.failed += 1;
        if (status === 'unpaid') acc.unpaid += 1;
        return acc;
      },
      { paid: 0, pending: 0, failed: 0, unpaid: 0 }
    );
  }, [passes]);

  // Filter passes based on search term
  const filteredPasses = passes.filter((pass) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      pass.source.toLowerCase().includes(searchLower) ||
      pass.destination.toLowerCase().includes(searchLower) ||
      pass.passNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'pending':
        return `${baseClasses} status-pending`;
      case 'approved':
        return `${baseClasses} status-approved`;
      case 'rejected':
        return `${baseClasses} status-rejected`;
      case 'expired':
        return `${baseClasses} status-expired`;
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Calendar className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const status = paymentStatus || 'unpaid';
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';

    switch (status) {
      case 'paid':
        return `${base} bg-green-100 text-green-800`;
      case 'pending':
        return `${base} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-amber-100 text-amber-800`;
    }
  };

  const handleDownloadPass = async (passId) => {
    try {
      // In a real implementation, this would generate and download a PDF
      toast.success('Pass downloaded successfully!');
      // window.open(`/api/passes/${passId}/download`, '_blank');
    } catch (error) {
      toast.error('Failed to download pass');
    }
  };

  const handleViewDetails = (passId) => {
    // Navigate to pass details page
    navigate(`/passes/${passId}`);
  };

  const handlePayNow = (passId) => {
    navigate(`/payment/${passId}`);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading your passes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Passes</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all your transport pass applications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by route or pass number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10 appearance-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Notify Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card border-l-4 border-amber-500">
          <p className="text-sm text-gray-600">Unpaid</p>
          <p className="text-2xl font-bold text-amber-700">{paymentSummary.unpaid}</p>
        </div>
        <div className="card border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Payment Pending</p>
          <p className="text-2xl font-bold text-blue-700">{paymentSummary.pending}</p>
        </div>
        <div className="card border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Payment Paid</p>
          <p className="text-2xl font-bold text-green-700">{paymentSummary.paid}</p>
        </div>
        <div className="card border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Payment Failed</p>
          <p className="text-2xl font-bold text-red-700">{paymentSummary.failed}</p>
        </div>
      </div>

      {/* Passes List */}
      <div className="card">
        {filteredPasses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No passes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by applying for your first transport pass.'}
            </p>
            {!searchTerm && !statusFilter && (
              <div className="mt-6">
                <a
                  href="/apply-pass"
                  className="btn btn-primary"
                >
                  Apply for Pass
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Pass Details</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Application Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pass.source.charAt(0).toUpperCase() + pass.source.slice(1)} →{' '}
                            {pass.destination.charAt(0).toUpperCase() + pass.destination.slice(1)}
                          </div>
                          {pass.passNumber && (
                            <div className="text-sm text-gray-500">Pass #{pass.passNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {pass.duration === '1-month' && '1 Month'}
                          {pass.duration === '3-months' && '3 Months'}
                          {pass.duration === '6-months' && '6 Months'}
                          {pass.duration === '1-year' && '1 Year'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">₹{pass.price}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(pass.status)}
                        <span className={`ml-2 ${getStatusBadge(pass.status)}`}>
                          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getPaymentStatusBadge(pass.paymentStatus)}>
                        {(pass.paymentStatus || 'unpaid').charAt(0).toUpperCase() +
                          (pass.paymentStatus || 'unpaid').slice(1)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {format(new Date(pass.applicationDate), 'MMM dd, yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(pass._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {['unpaid', 'failed'].includes(pass.paymentStatus || 'unpaid') && (
                          <button
                            onClick={() => handlePayNow(pass._id)}
                            className="text-amber-600 hover:text-amber-900 text-xs font-semibold"
                            title="Pay Now"
                          >
                            Pay Now
                          </button>
                        )}
                        {pass.status === 'approved' && (
                          <button
                            onClick={() => handleDownloadPass(pass._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Pass"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPasses;
