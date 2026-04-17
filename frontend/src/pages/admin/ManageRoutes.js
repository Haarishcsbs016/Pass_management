import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { routeAPI } from '../../services/api';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Navigation,
  Clock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ManageRoutes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const { data: routesData, isLoading, refetch } = useQuery(
    ['adminRoutes', currentPage],
    () => routeAPI.getAllRoutes({ page: currentPage, limit: 10 }),
    {
      select: (response) => response.data.data,
      keepPreviousData: true,
    }
  );

  const createRouteMutation = useMutation(routeAPI.createRoute, {
    onSuccess: () => {
      toast.success('Route created successfully!');
      setShowAddModal(false);
      reset();
      queryClient.invalidateQueries('adminRoutes');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create route');
    },
  });

  const updateRouteMutation = useMutation(
    ({ id, data }) => routeAPI.updateRoute(id, data),
    {
      onSuccess: () => {
        toast.success('Route updated successfully!');
        setShowEditModal(false);
        setSelectedRoute(null);
        reset();
        queryClient.invalidateQueries('adminRoutes');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update route');
      },
    }
  );

  const deleteRouteMutation = useMutation(routeAPI.deleteRoute, {
    onSuccess: () => {
      toast.success('Route deleted successfully!');
      queryClient.invalidateQueries('adminRoutes');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete route');
    },
  });

  const routes = routesData?.routes || [];
  const pagination = routesData?.pagination || {};

  // Filter routes based on search term
  const filteredRoutes = routes.filter((route) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      route.source.toLowerCase().includes(searchLower) ||
      route.destination.toLowerCase().includes(searchLower)
    );
  });

  const handleAddRoute = (data) => {
    createRouteMutation.mutate(data);
  };

  const handleEditRoute = (data) => {
    updateRouteMutation.mutate({
      id: selectedRoute._id,
      data,
    });
  };

  const handleDeleteRoute = (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteRouteMutation.mutate(routeId);
    }
  };

  const openEditModal = (route) => {
    setSelectedRoute(route);
    setValue('source', route.source);
    setValue('destination', route.destination);
    setValue('basePrice', route.basePrice);
    setValue('distance', route.distance);
    setValue('estimatedTime', route.estimatedTime);
    setValue('routeType', route.routeType);
    setShowEditModal(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading routes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Routes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add, edit, and manage transport routes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by source or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Routes List */}
      <div className="card">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No routes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first route.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  Add Route
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Distance</th>
                  <th>Base Price</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <Navigation className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {route.source.charAt(0).toUpperCase() + route.source.slice(1)} →{' '}
                          {route.destination.charAt(0).toUpperCase() + route.destination.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">{route.distance} km</td>
                    <td>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">₹{route.basePrice}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{route.estimatedTime}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {route.routeType}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        route.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(route)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Route"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Route"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

      {/* Add Route Modal */}
      {showAddModal && (
        <RouteModal
          title="Add New Route"
          onSubmit={handleSubmit(handleAddRoute)}
          onClose={() => {
            setShowAddModal(false);
            reset();
          }}
          register={register}
          errors={errors}
          isLoading={createRouteMutation.isLoading}
        />
      )}

      {/* Edit Route Modal */}
      {showEditModal && selectedRoute && (
        <RouteModal
          title="Edit Route"
          onSubmit={handleSubmit(handleEditRoute)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRoute(null);
            reset();
          }}
          register={register}
          errors={errors}
          isLoading={updateRouteMutation.isLoading}
        />
      )}
    </div>
  );
};

// Route Modal Component
const RouteModal = ({ title, onSubmit, onClose, register, errors, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source *
                    </label>
                    <input
                      {...register('source', { required: 'Source is required' })}
                      type="text"
                      className="input-field"
                      placeholder="e.g., Delhi"
                    />
                    {errors.source && (
                      <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination *
                    </label>
                    <input
                      {...register('destination', { required: 'Destination is required' })}
                      type="text"
                      className="input-field"
                      placeholder="e.g., Mumbai"
                    />
                    {errors.destination && (
                      <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      {...register('basePrice', { 
                        required: 'Base price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="500"
                    />
                    {errors.basePrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance (km) *
                    </label>
                    <input
                      {...register('distance', { 
                        required: 'Distance is required',
                        min: { value: 0, message: 'Distance must be positive' }
                      })}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="250"
                    />
                    {errors.distance && (
                      <p className="mt-1 text-sm text-red-600">{errors.distance.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time *
                    </label>
                    <input
                      {...register('estimatedTime', { required: 'Estimated time is required' })}
                      type="text"
                      className="input-field"
                      placeholder="4 hours 30 mins"
                    />
                    {errors.estimatedTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Route Type
                    </label>
                    <select {...register('routeType')} className="input-field">
                      <option value="bus">Bus</option>
                      <option value="metro">Metro</option>
                      <option value="train">Train</option>
                      <option value="combined">Combined</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="spinner mr-2"></div>
                ) : null}
                {title.includes('Edit') ? 'Update Route' : 'Add Route'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageRoutes;
