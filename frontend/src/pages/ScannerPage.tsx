// frontend/src/pages/ScannerPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  RotateCcw,
  Keyboard,
} from 'lucide-react';

export default function ScannerPage() {
  const [ticketId, setTicketId] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedId = useRef<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleCheckIn = async (id: string, isManual: boolean = false) => {
    const trimmedId = id.trim();
    if (loading || trimmedId === lastScannedId.current) return;

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await api.put(
        `/registrations/${trimmedId}/check-in`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      lastScannedId.current = trimmedId;
      setMessage(response.data.message || 'Check-in successful!');

      if (isManual) {
        setTicketId('');
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setMessage(axiosError.response?.data?.message || 'Check-in failed.');
      setIsError(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        lastScannedId.current = null;
      }, 3000);
    }
  };

  const startScanner = async () => {
    setMessage('');
    setIsScanning(true);

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 }, // Made slightly smaller to ensure it fits
        },
        (decodedText) => {
          handleCheckIn(decodedText, false);
        },
        () => {},
      );
    } catch (err) {
      console.error('Failed to start camera', err);
      // Expose the exact library error to the UI
      const errorMsg =
        err?.message ||
        'Failed to access camera. Check permissions or use manual input.';
      setMessage(errorMsg);
      setIsError(true);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to stop camera', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn(ticketId, true);
  };

  return (
    <div className="text-zinc-100">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Event Check-in Scanner
        </h1>
        <p className="mt-1 text-zinc-400">
          Scan the QR code or enter the ticket ID manually.
        </p>
      </div>

      {/* Side-by-Side Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Camera View */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
          <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Camera Scanner
          </h3>

          <div className="relative mb-4 overflow-hidden bg-zinc-950 border border-zinc-800 rounded-lg aspect-square">
            <div id="qr-reader" className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <Camera className="w-12 h-12 mb-4 text-zinc-700" />
                <p className="text-sm text-zinc-500 mb-4">
                  Camera is currently off.
                </p>
                <button
                  onClick={startScanner}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Start Camera
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/5 h-3/5 border-4 border-indigo-500/80 rounded-xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
              </div>
            )}
          </div>

          {isScanning && (
            <button
              onClick={stopScanner}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Stop Camera
            </button>
          )}
        </div>

        {/* Right Column: Manual Input & Status */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
          <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Manual Input
          </h3>

          <form onSubmit={handleManualSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="ticketId"
                className="block mb-2 text-sm font-medium text-zinc-400"
              >
                Ticket ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Keyboard className="w-5 h-5 text-zinc-600" />
                </div>
                <input
                  id="ticketId"
                  name="ticketId"
                  type="text"
                  required
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="block w-full py-3 pl-11 pr-3 text-white placeholder-zinc-600 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g., 65a1b2c3d4e5f6..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Check In Attendee'}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-xs text-zinc-500">STATUS</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          {message ? (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${isError ? 'bg-red-950/50 border-red-900/50' : 'bg-green-950/50 border-green-900/50'}`}
            >
              {isError ? (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-medium ${isError ? 'text-red-300' : 'text-green-300'}`}
              >
                {message}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="w-5 h-5 mt-0.5 border-2 border-zinc-700 rounded-full"></div>
              <p className="text-sm font-medium text-zinc-500">
                Waiting for scan or input...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
