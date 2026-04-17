import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Bus, ShieldCheck, Timer, Sparkles } from 'lucide-react';

const Login = ({ initialMode = 'login' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const { login, register: registerUser, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let authResponse;
      if (mode === 'login') {
        authResponse = await login({ email: data.email, password: data.password });
      } else {
        authResponse = await registerUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
          },
        });
      }

      if (authResponse?.data?.user) {
        const userRole = authResponse.data.user.role;
        navigate(userRole === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      }
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
            <h1 className="auth-brand-title mt-6">Commute management built for modern cities</h1>
            <p className="auth-brand-copy">
              Apply passes in minutes, track approvals in real time, and keep your daily travel effortless.
            </p>
            <div className="auth-brand-points">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Bank-grade authentication</div>
              <div className="flex items-center gap-2"><Timer className="h-4 w-4" /> Fast approvals and status tracking</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Designed for students and professionals</div>
            </div>
          </div>
          <p className="text-xs text-teal-50/80">Trusted transport workflow for institutions and enterprises</p>
        </aside>

        <section className="auth-card my-auto">
          <div className="mb-8">
            <div className="auth-icon-wrap">
              <Bus className="h-6 w-6" />
            </div>
            <div className="mt-4 flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-xl px-4 py-2 transition-colors ${mode === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 rounded-xl px-4 py-2 transition-colors ${mode === 'register' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}
              >
                Sign up
              </button>
            </div>
            <h2 className="auth-heading mt-4">
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </h2>
            <p className="auth-subheading">
              {mode === 'login'
                ? 'New here? Use the Sign up tab to create a new account.'
                : 'Already have an account? Switch back to Sign in.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {mode === 'register' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="auth-label">Full Name</label>
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
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="auth-label">Phone Number</label>
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
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="auth-label">Address (Optional)</label>
                  <input {...register('address.street')} type="text" className="auth-input mb-3" placeholder="Street Address" />
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register('address.city')} type="text" className="auth-input" placeholder="City" />
                    <input {...register('address.state')} type="text" className="auth-input" placeholder="State" />
                  </div>
                  <input {...register('address.pincode')} type="text" className="auth-input mt-3" placeholder="Pincode" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="auth-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className="auth-input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="auth-input pr-11"
                  placeholder="Password"
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

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === passwordValue || 'Passwords do not match',
                  })}
                  type="password"
                  className="auth-input"
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  Remember me
                </label>
                <button type="button" className="auth-link">Need help?</button>
              </div>
            )}

            <div className="flex items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="auth-button"
              >
                {isLoading ? <div className="spinner mr-2"></div> : null}
                {mode === 'login' ? 'Sign in securely' : 'Create account'}
              </button>
            </div>

            {mode === 'login' ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-semibold">Quick demo:</span> use the admin credentials to open the control panel.
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'admin@transport.com', { shouldDirty: true });
                    setValue('password', 'admin123', { shouldDirty: true });
                  }}
                  className="ml-2 auth-link"
                >
                  Use demo credentials
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">
                By creating an account, you agree to the platform transport policy and verification terms.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
