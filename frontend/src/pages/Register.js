import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Bus, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell flex items-center">
      <div className="auth-grid items-stretch">
        <aside className="auth-brand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">
              <Bus className="h-4 w-4" />
              UrbanPass Pro
            </div>
            <h1 className="auth-brand-title mt-6">Create your profile and start smarter commuting</h1>
            <p className="auth-brand-copy">
              Register once to apply, track, and renew transport passes with complete visibility.
            </p>
            <div className="auth-brand-points">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Fast multi-step approvals</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Real-time pass status updates</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Secure identity document workflow</div>
            </div>
          </div>
          <p className="text-xs text-teal-50/80">Built for reliable daily transit operations</p>
        </aside>

        <section className="auth-card my-auto">
          <div className="mb-8">
            <div className="auth-icon-wrap">
              <Bus className="h-6 w-6" />
            </div>
            <h2 className="auth-heading mt-4">Create your account</h2>
            <p className="auth-subheading">
              Already registered? <Link to="/login" className="auth-link">Sign in instead</Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="auth-label">
                Full Name
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
                className="auth-input"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="auth-input"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="auth-label">
                Phone Number
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
                className="auth-input"
                placeholder="1234567890"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="auth-label">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                type="password"
                className="auth-input"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="auth-label">
                Address (Optional)
              </label>
              <input
                {...register('address.street')}
                type="text"
                className="auth-input"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  {...register('address.city')}
                  type="text"
                  className="auth-input"
                  placeholder="City"
                />
                <input
                  {...register('address.state')}
                  type="text"
                  className="auth-input"
                  placeholder="State"
                />
              </div>
              <input
                {...register('address.pincode')}
                type="text"
                className="auth-input"
                placeholder="Pincode"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? (
                <div className="spinner mr-2"></div>
              ) : null}
              Create account
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            By creating an account, you agree to the platform transport policy and verification terms.
          </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Register;
