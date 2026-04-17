import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { passAPI } from '../../services/api';
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
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagePasses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPass, setSelectedPass] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: passesData, isLoading, refetch } = useQuery(
    ['adminPasses', currentPage, statusFilter],
    () => passAPI.getAllPasses({ 
      page: currentPage, 
      limit: 10,
      ...(statusFilter && { status: statusFilter })
    }),
    {
      select: (response) => response.data.data,
      keepPreviousData: true,
    }
  );

  const approvePassMutation = useMutation(
    ({ id, status, rejectionReason }) => 
      passAPI.updatePassStatus(id, { status, rejectionReason }),
    {
      onSuccess: () => {
        toast.success('Pass status updated successfully!');
        setShowRejectModal(false);
        setSelectedPass(null);
        setRejectionReason('');
        queryClient.invalidateQueries('adminPasses');
        queryClient.invalidateQueries('adminStatistics');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update pass status');
      },
    }
  );

  const passes = passesData?.passes || [];
  const pagination = passesData?.pagination || {};

  // Filter passes based on search term
  const filteredPasses = passes.filter((pass) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      pass.source.toLowerCase().includes(searchLower) ||
      pass.destination.toLowerCase().includes(searchLower) ||
      pass.passNumber?.toLowerCase().includes(searchLower) ||
      pass.userId?.name?.toLowerCase().includes(searchLower) ||
      pass.userId?.email?.toLowerCase().includes(searchLower)
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

  const getPaymentBadge = (paymentStatus) => {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold';

    switch (paymentStatus) {
      case 'paid':
        return `${base} bg-green-100 text-green-800`;
      case 'pending':
        return `${base} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-slate-100 text-slate-800`;
    }
  };

  const handleApprove = (passId) => {
    const selected = passes.find((item) => item._id === passId);
    if (selected && selected.paymentStatus !== 'paid') {
      toast.error('Approve is allowed only after payment is completed');
      return;
    }

    approvePassMutation.mutate({
      id: passId,
      status: 'approved'
    });
  };

  const handleReject = (pass) => {
    setSelectedPass(pass);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    approvePassMutation.mutate({
      id: selectedPass._id,
      status: 'rejected',
      rejectionReason
    });
  };

  const handleViewDetails = (passId) => {
    // Navigate to pass details page or open modal
    window.location.href = `/passes/${passId}`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading passes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Passes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and manage all transport pass applications
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
                placeholder="Search by applicant, route, or pass number..."
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

      {/* Passes List */}
      <div className="card">
        {filteredPasses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No passes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No pass applications available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Route</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Payment</th>
                  <th>Status</th>
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
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pass.userId?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pass.userId?.email}
                          </div>
                          {pass.passNumber && (
                            <div className="text-xs text-gray-400">
                              Pass #{pass.passNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {pass.source.charAt(0).toUpperCase() + pass.source.slice(1)} →{' '}
                          {pass.destination.charAt(0).toUpperCase() + pass.destination.slice(1)}
                        </span>
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
                      <span className={getPaymentBadge(pass.paymentStatus)}>
                        {(pass.paymentStatus || 'unpaid').charAt(0).toUpperCase() +
                          (pass.paymentStatus || 'unpaid').slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(pass.status)}>
                        {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                      </span>
                      {pass.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {pass.rejectionReason}
                        </div>
                      )}
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
                        {pass.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(pass._id)}
                              className="text-green-600 hover:text-green-900"
                              title={
                                pass.paymentStatus === 'paid'
                                  ? 'Approve'
                                  : 'Payment required before approval'
                              }
                              disabled={approvePassMutation.isLoading || pass.paymentStatus !== 'paid'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(pass)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {pass.status === 'approved' && (
                          <button
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

      {/* Rejection Modal */}
      {showRejectModal && selectedPass && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowRejectModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Pass Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to reject this pass application for{' '}
                        <span className="font-medium">
                          {selectedPass.userId?.name}
                        </span>?
                      </p>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason *
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="input-field"
                          placeholder="Please provide a reason for rejection..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmReject}
                  disabled={approvePassMutation.isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {approvePassMutation.isLoading ? (
                    <div className="spinner mr-2"></div>
                  ) : null}
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPass(null);
                    setRejectionReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePasses;
