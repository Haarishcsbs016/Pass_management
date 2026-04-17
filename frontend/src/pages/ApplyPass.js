import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from 'react-query';
import { routeAPI, passAPI } from '../services/api';
import { Upload, X, MapPin, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplyPass = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const watchedSource = watch('source');
  const watchedDestination = watch('destination');
  const watchedDuration = watch('duration');

  // Fetch routes
  const { data: routesData, isLoading: routesLoading } = useQuery(
    'routes',
    () => routeAPI.getAllRoutes(),
    {
      select: (response) => response.data.data.routes,
    }
  );

  // Calculate price mutation
  const calculatePriceMutation = useMutation(routeAPI.calculatePrice, {
    onSuccess: (response) => {
      setCalculatedPrice(response.data.data.calculatedPrice);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to calculate price');
    },
  });

  // Apply pass mutation
  const applyPassMutation = useMutation(passAPI.applyPass, {
    onSuccess: (response) => {
      toast.success('Application submitted! Redirecting to payment...');
      // Redirect to payment page with the pass ID
      const passId = response.data.data.pass._id;
      setTimeout(() => {
        navigate(`/payment/${passId}`);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  // Calculate price when route and duration change
  useEffect(() => {
    if (watchedSource && watchedDestination && watchedDuration) {
      calculatePriceMutation.mutate({
        source: watchedSource,
        destination: watchedDestination,
        duration: watchedDuration,
      });
    } else {
      setCalculatedPrice(null);
    }
  }, [watchedSource, watchedDestination, watchedDuration]);

  const routes = routesData || [];
  const uniqueSources = [...new Set(routes.map((route) => route.source))];
  const availableDestinations = watchedSource
    ? [...new Set(routes.filter((route) => route.source === watchedSource).map((route) => route.destination))]
    : [...new Set(routes.map((route) => route.destination))];

  useEffect(() => {
    if (watchedDestination && watchedSource && !availableDestinations.includes(watchedDestination)) {
      setValue('destination', '');
    }
  }, [watchedSource, watchedDestination, availableDestinations, setValue]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (selectedFiles.length + validFiles.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    const formData = new FormData();
    formData.append('source', data.source);
    formData.append('destination', data.destination);
    formData.append('duration', data.duration);

    selectedFiles.forEach((file) => {
      formData.append('documents', file);
    });

    applyPassMutation.mutate(formData);
  };

  if (routesLoading) {
    return <div className="flex justify-center py-8">Loading routes...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Apply for Transport Pass</h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill in the details below to apply for your transport pass
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Route Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Source
              </label>
              <select
                {...register('source', { required: 'Source is required' })}
                className="input-field"
              >
                <option value="">Select source</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Destination
              </label>
              <select
                {...register('destination', { required: 'Destination is required' })}
                className="input-field"
              >
                <option value="">Select destination</option>
                {availableDestinations.map((destination) => (
                  <option key={destination} value={destination}>
                    {destination.charAt(0).toUpperCase() + destination.slice(1)}
                  </option>
                ))}
              </select>
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Pass Duration
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['1-month', '3-months', '6-months', '1-year'].map((duration) => (
                <label
                  key={duration}
                  className={`relative flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    watchedDuration === duration
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    {...register('duration', { required: 'Duration is required' })}
                    type="radio"
                    value={duration}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {duration === '1-month' && '1 Month'}
                    {duration === '3-months' && '3 Months'}
                    {duration === '6-months' && '6 Months'}
                    {duration === '1-year' && '1 Year'}
                  </span>
                </label>
              ))}
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Price Display */}
          {calculatedPrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Calculated Price</p>
                  <p className="text-2xl font-bold text-blue-900">₹{calculatedPrice}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Upload Documents (ID Proof, Address Proof, etc.)
            </label>
            <div
              className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, PDF, DOC, DOCX up to 5MB each (Max 3 files)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyPassMutation.isLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {applyPassMutation.isLoading ? (
                <div className="spinner mr-2"></div>
              ) : null}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPass;
