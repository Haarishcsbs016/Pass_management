import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user.name,
      phone: user.phone,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (!user) {
    return <div className="flex justify-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-primary"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>

            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address
                    </label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900">{user.phone}</p>
                  </div>
                </div>

                {(user.address?.street || user.address?.city || user.address?.state || user.address?.pincode) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {[
                        user.address?.street,
                        user.address?.city,
                        user.address?.state,
                        user.address?.pincode
                      ].filter(Boolean).join(', ') || 'No address provided'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      maxLength: {
                        value: 50,
                        message: 'Name cannot exceed 50 characters',
                      },
                    })}
                    type="text"
                    className="input-field"
                    defaultValue={user.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input-field bg-gray-100"
                      title="Email cannot be changed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number',
                        },
                      })}
                      type="tel"
                      className="input-field"
                      defaultValue={user.phone}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <div className="space-y-3">
                    <input
                      {...register('address.street')}
                      type="text"
                      className="input-field"
                      placeholder="Street Address"
                      defaultValue={user.address?.street}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        {...register('address.city')}
                        type="text"
                        className="input-field"
                        placeholder="City"
                        defaultValue={user.address?.city}
                      />
                      <input
                        {...register('address.state')}
                        type="text"
                        className="input-field"
                        placeholder="State"
                        defaultValue={user.address?.state}
                      />
                    </div>
                    <input
                      {...register('address.pincode')}
                      type="text"
                      className="input-field"
                      placeholder="Pincode"
                      defaultValue={user.address?.pincode}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="spinner mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="text-sm font-medium text-gray-900">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved Passes</span>
                <span className="text-sm font-medium text-gray-900">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Passes</span>
                <span className="text-sm font-medium text-gray-900">-</span>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="card-header border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-900">Security Tips</h3>
            </div>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• Keep your password secure</p>
              <p>• Don't share your login credentials</p>
              <p>• Update your profile information</p>
              <p>• Monitor your pass applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
