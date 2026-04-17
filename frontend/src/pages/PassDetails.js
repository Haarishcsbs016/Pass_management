import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { passAPI } from '../services/api';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: passData, isLoading } = useQuery(
    ['pass', id],
    () => passAPI.getPass(id),
    {
      select: (response) => response.data.data.pass,
      enabled: !!id,
    }
  );

  const pass = passData;

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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownloadPass = async () => {
    try {
      // In a real implementation, this would generate and download a PDF
      toast.success('Pass downloaded successfully!');
      // window.open(`/api/passes/${pass._id}/download`, '_blank');
    } catch (error) {
      toast.error('Failed to download pass');
    }
  };

  const handleViewDocument = (document) => {
    // In a real implementation, this would open the document
    window.open(`/uploads/${document.filename}`, '_blank');
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading pass details...</div>;
  }

  if (!pass) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Pass not found</h3>
        <p className="mt-1 text-sm text-gray-500">The pass you're looking for doesn't exist.</p>
        <div className="mt-6">
          <button onClick={() => navigate('/my-passes')} className="btn btn-primary">
            Back to My Passes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pass Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              View detailed information about your transport pass
            </p>
          </div>
        </div>
        {pass.status === 'approved' && (
          <button
            onClick={handleDownloadPass}
            className="btn btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Pass
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pass Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pass Status Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Pass Information</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(pass.status)}
                <span className={getStatusBadge(pass.status)}>
                  {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {pass.passNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Pass Number</p>
                      <p className="text-lg font-bold text-blue-900">{pass.passNumber}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {pass.source.charAt(0).toUpperCase() + pass.source.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {pass.destination.charAt(0).toUpperCase() + pass.destination.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {pass.duration === '1-month' && '1 Month'}
                      {pass.duration === '3-months' && '3 Months'}
                      {pass.duration === '6-months' && '6 Months'}
                      {pass.duration === '1-year' && '1 Year'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <div className="flex items-center mt-1">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">₹{pass.price}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Date</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(pass.applicationDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                {pass.approvedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approved Date</label>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(pass.approvedDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {pass.expiryDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(pass.expiryDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              {pass.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-red-900 mb-2">
                    Rejection Reason
                  </label>
                  <p className="text-sm text-red-800">{pass.rejectionReason}</p>
                </div>
              )}

              {pass.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {pass.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {pass.documents && pass.documents.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
              </div>
              <div className="space-y-3">
                {pass.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.size / 1024).toFixed(1)} KB • Uploaded on{' '}
                          {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Applicant Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{pass.userId?.name}</p>
                  <p className="text-sm text-gray-500">{pass.userId?.email}</p>
                </div>
              </div>
              
              {pass.userId?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{pass.userId.phone}</p>
                </div>
              )}

              {pass.userId?.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm text-gray-900">
                    {[
                      pass.userId.address.street,
                      pass.userId.address.city,
                      pass.userId.address.state,
                      pass.userId.address.pincode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {pass.status === 'approved' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPass}
                  className="w-full btn btn-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Pass
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full btn btn-secondary"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Details
                </button>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900">Need Help?</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• For approved passes, download and carry a copy</p>
              <p>• Contact support for any issues with your pass</p>
              <p>• Renew passes before expiry date</p>
              <p>• Keep your documents updated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassDetails;
