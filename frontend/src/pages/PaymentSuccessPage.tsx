// frontend/src/pages/PaymentSuccessPage.tsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId || !accessToken) {
      setStatus('error');
      setMessage('Missing payment information. Please try again.');
      return;
    }

    const verifyPayment = async () => {
      try {
        await api.post('/payments/verify', { sessionId }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setStatus('success');
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(axiosError.response?.data?.message || 'Failed to verify payment.');
      }
    };

    verifyPayment();
  }, [sessionId, accessToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
          <p className="text-zinc-400">Please wait while we confirm your transaction and issue your ticket.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="p-3 mb-6 bg-green-900/30 rounded-full border border-green-800/50">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-zinc-400 mb-8">Your ticket has been confirmed and sent to your email.</p>
          <Link to="/my-tickets" className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
            View My Tickets
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="p-3 mb-6 bg-red-900/30 rounded-full border border-red-800/50">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-zinc-400 mb-8">{message}</p>
          <Link to="/events" className="px-6 py-3 text-sm font-medium text-white bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">
            Back to Events
          </Link>
        </>
      )}
    </div>
  );
}