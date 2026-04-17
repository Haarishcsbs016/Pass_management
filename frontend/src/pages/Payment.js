import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AlertCircle, Check, Loader, Home } from 'lucide-react';

const Payment = () => {
  const demoModeEnabled = process.env.REACT_APP_PAYMENT_DEMO_MODE === 'true';
  const { passId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  const currentPaymentStatus = paymentStatus || pass?.paymentStatus || 'unpaid';

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch pass details
  useEffect(() => {
    const fetchPass = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/passes/${passId}`);
        setPass(response.data.data.pass);
        setPaymentStatus(response.data.data.pass.paymentStatus);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pass:', err);
        setError('Failed to load pass details. Redirecting...');
        setLoading(false);
        setTimeout(() => navigate('/my-passes'), 2000);
      }
    };

    if (passId) {
      fetchPass();
    }
  }, [passId, navigate]);

  // Handle payment initiation
  const handlePaymentClick = async () => {
    try {
      if (currentPaymentStatus === 'paid') {
        toast.success('Payment already completed!');
        navigate('/my-passes');
        return;
      }

      setProcessing(true);
      setError(null);

      // Create order on backend
      const orderResponse = await api.post('/payment/create-order', {
        passId: passId,
        amount: pass.price,
        demo: demoModeEnabled
      });

      const {
        orderId,
        keyId,
        amount,
        currency,
        userEmail,
        userName,
        userPhone,
        demoMode
      } =
        orderResponse.data;

      if (demoMode) {
        await handlePaymentSuccess(
          {
            razorpay_order_id: orderId,
            razorpay_payment_id: `demo_pay_${Date.now()}`,
            razorpay_signature: 'demo_signature'
          },
          true
        );
        return;
      }

      if (!window.Razorpay) {
        throw new Error('Payment SDK did not load. Please refresh and retry.');
      }

      // Razorpay payment options
      const options = {
        key: keyId,
        amount: amount, // amount in paise
        currency: currency,
        order_id: orderId,
        name: 'Public Transport Pass',
        description: `${pass.source} → ${pass.destination} (${pass.duration})`,
        image: 'https://via.placeholder.com/150',
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },
        notes: {
          passId: passId,
          source: pass.source,
          destination: pass.destination
        },
        handler: (response) => handlePaymentSuccess(response, false),
        modal: {
          ondismiss: handlePaymentDismiss
        },
        theme: {
          color: '#0f766e' // Teal color - matches your brand
        }
      };

      // Create and open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setProcessing(false);
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err.response?.data?.message || 'Failed to initiate payment. Please try again.'
      );
      setProcessing(false);
      toast.error('Payment initiation failed');
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response, demoMode = false) => {
    try {
      setProcessing(true);

      // Verify payment on backend
      const verifyResponse = await api.post('/payment/verify-payment', {
        passId: passId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        demo: demoMode
      });

      if (verifyResponse.data.success) {
        setPaymentStatus('paid');
        setProcessing(false);
        toast.success(
          demoMode
            ? 'Demo payment successful! Your pass is now approved.'
            : 'Payment successful! Your pass is now approved.'
        );
        
        // Redirect to my-passes after 2 seconds
        setTimeout(() => {
          navigate('/my-passes');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Payment verification failed. Please contact support.');
      setProcessing(false);
      toast.error('Payment verification failed');
    }
  };

  // Handle payment dismissal
  const handlePaymentDismiss = async () => {
    try {
      setProcessing(false);
      // Record failed payment attempt
      await api.post('/payment/failed', {
        passId: passId,
        error_reason: 'User dismissed payment modal'
      });
      toast.error('Payment cancelled. You can retry anytime.');
    } catch (err) {
      console.error('Error recording failed payment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            Pass Not Found
          </h2>
          <p className="text-center text-slate-600 mb-6">
            The pass you're trying to pay for could not be found.
          </p>
          <button
            onClick={() => navigate('/my-passes')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Back to My Passes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-passes')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-4"
          >
            <Home className="w-4 h-4" />
            Back to My Passes
          </button>
          <h1 className="text-4xl font-bold text-slate-900">Payment Checkout</h1>
          <p className="text-slate-600 mt-2">Complete your transport pass payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pass Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Pass Details</h2>

              {/* Route Information */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">ROUTE</p>
                    <p className="text-xl font-bold text-slate-900">
                      {pass.source} → {pass.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-semibold mb-1">DURATION</p>
                    <p className="text-xl font-bold text-slate-900">
                      {pass.duration.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applicant Information */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
                  Applicant Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Name:</span>
                    <span className="font-semibold text-slate-900">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Email:</span>
                    <span className="font-semibold text-slate-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Phone:</span>
                    <span className="font-semibold text-slate-900">{user?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
                  Application Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Application Status:</span>
                    <span
                      className={`px-4 py-1 rounded-full font-semibold text-sm ${
                        pass.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : pass.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Payment Status:</span>
                    <span
                      className={`px-4 py-1 rounded-full font-semibold text-sm ${
                        currentPaymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : currentPaymentStatus === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {currentPaymentStatus.charAt(0).toUpperCase() + currentPaymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {pass.documents && pass.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase">
                    Uploaded Documents
                  </h3>
                  <div className="space-y-2">
                    {pass.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <span className="text-slate-700">{doc.originalName}</span>
                        <span className="text-sm text-slate-600">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Summary</h3>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Base Price:</span>
                  <span className="font-semibold text-slate-900">₹{pass.price}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Duration:</span>
                  <span>{pass.duration}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-8 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-200">
                <p className="text-sm text-slate-600 text-center mb-2">TOTAL AMOUNT</p>
                <p className="text-4xl font-bold text-teal-600 text-center">₹{pass.price}</p>
              </div>

              {/* Payment Button */}
              {currentPaymentStatus === 'paid' ? (
                <div className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4">
                  <Check className="w-5 h-5" />
                  Payment Completed
                </div>
              ) : currentPaymentStatus === 'pending' ? (
                <div className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4">
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                <button
                  onClick={handlePaymentClick}
                  disabled={processing}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 mb-4 ${
                    processing
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    demoModeEnabled ? 'Pay in Demo Mode' : 'Pay with Razorpay'
                  )}
                </button>
              )}

              {demoModeEnabled && (
                <div className="p-4 mb-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-900">
                    Demo mode is enabled. No real payment is processed. This is for project demonstration only.
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  💳 <strong>Secure Payment</strong>
                  <br />
                  After payment, your application will move to "Pending Approval". Admin will
                  review your documents and approve/reject within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
