// frontend/src/pages/MyTicketsPage.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- Import createPortal
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Ticket as TicketIcon, CalendarDays, MapPin, Armchair, Download, Share2, Wallet, Video, Lock } from 'lucide-react';

interface Registration {
  id: string;
  eventId: {
    title: string;
    date: string;
    location: string;
    isVirtual?: boolean;
    meetingUrl?: string | null;
  };
  status: string;
  createdAt: string;
}

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMeetingUrl, setActiveMeetingUrl] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/registrations/my-tickets', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const safeData = response.data.data.map((reg: Registration) => ({
          id: reg.id,
          status: reg.status,
          createdAt: reg.createdAt,
          eventId: reg.eventId
        }));
        
        setRegistrations(safeData);
      } catch (error) {
        console.error('Failed to fetch tickets', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [accessToken]);

  const handleShare = async (reg: Registration) => {
    const shareData = {
      title: `Ticket for ${reg.eventId?.title || 'Event'}`,
      text: `Check out my ticket for ${reg.eventId?.title || 'Event'}!`,
      url: window.location.href, 
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert('Ticket link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadPDF = (reg: Registration, seat: string) => {
    const qrSvg = document.getElementById(`qr-${reg.id}`)?.outerHTML;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Please allow popups to download the PDF.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${reg.eventId?.title || 'Event'}</title>
          <style>
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f4f5; }
            .ticket { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; width: 300px; }
            h1 { font-size: 24px; margin-bottom: 10px; color: #18181b; }
            p { color: #71717a; margin: 4px 0; font-size: 14px; }
            .seat { font-size: 32px; font-weight: bold; color: #4f46e5; margin: 20px 0; }
            .qr { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1>${reg.eventId?.title || 'Event'}</h1>
            <p>${reg.eventId?.date ? new Date(reg.eventId.date).toLocaleString() : 'N/A'}</p>
            <p>${reg.eventId?.location || 'Online Event'}</p>
            <div class="seat">Seat: ${seat}</div>
            <div class="qr">${qrSvg || 'QR Code'}</div>
            <p style="font-size: 10px; word-break: break-all; color: #a1a1aa;">ID: ${reg.id}</p>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddToWallet = () => {
    alert('Apple Wallet / Google Wallet integration is coming soon!');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-zinc-500">Loading your tickets...</div>;
  }

  return (
    <div className="text-zinc-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">My Tickets</h1>
        {/* Conditional Header Text */}
        <p className="mt-1 text-zinc-400">
          {registrations.some(reg => reg.eventId?.isVirtual) 
            ? 'Access your virtual event links below.' 
            : 'Present these QR codes at the door for entry.'}
        </p>
      </div>
      
      {/* RESPONSIVE EMBEDDED JITSI VIDEO CALL MODAL (Using Portal) */}
      {activeMeetingUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Live Meeting Room</h2>
              <p className="text-xs text-zinc-400">Please allow camera & microphone access in your browser.</p>
            </div>
            <button 
              onClick={() => setActiveMeetingUrl(null)}
              className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium flex-shrink-0"
            >
              Leave Meeting
            </button>
          </div>
          {/* Responsive flex container for the iframe */}
          <div className="flex-1 w-full relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700">
            <iframe
              allow="camera; microphone; fullscreen; display-capture"
              src={`${activeMeetingUrl}#config.prejoinPageEnabled=true&userInfo.displayName=${encodeURIComponent(user?.firstName || 'Guest')}`}
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>,
        document.body // Render directly on the body to escape the Sidebar's z-index context
      )}

      {registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <TicketIcon className="w-10 h-10 mb-4 text-zinc-700" />
          <p className="text-zinc-500">You haven't bought any tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {registrations.map((reg) => {
            const mockSeat = `A${Math.floor(Math.random() * 20) + 1}`;

            return (
              <div key={reg.id} className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white truncate">{reg.eventId?.title || 'Unknown Event'}</h2>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> {reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : 'N/A'}</span>
                        {reg.eventId?.isVirtual ? (
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <Video className="w-3 h-3" /> Online Event
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {reg.eventId?.location || 'N/A'}</span>
                        )}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-green-400 bg-green-950/50 border border-green-900/50 rounded-full">
                      {reg.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                      <QRCodeSVG id={`qr-${reg.id}`} value={reg.id} size={100} />
                    </div>
                    <div className="flex-1">
                      {/* Hide Seat for Virtual Events */}
                      {!reg.eventId?.isVirtual && (
                        <>
                          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Seat</p>
                          <p className="flex items-center gap-1.5 text-2xl font-bold text-white mb-2">
                            <Armchair className="w-5 h-5 text-indigo-400" />
                            {mockSeat}
                          </p>
                        </>
                      )}
                      <p className="mt-2 text-[10px] font-mono text-zinc-500 break-all">ID: {reg.id}</p>
                    </div>
                  </div>

                  {/* Embedded Join Live Meeting Button */}
                  {reg.eventId?.isVirtual && reg.eventId?.meetingUrl && (
                    <button 
                      onClick={() => setActiveMeetingUrl(reg.eventId.meetingUrl)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Live Meeting
                      <Lock className="w-3 h-3 ml-1 text-indigo-300" />
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button 
                      onClick={() => handleDownloadPDF(reg, reg.eventId?.isVirtual ? 'N/A' : mockSeat)}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button 
                      onClick={handleAddToWallet}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      Wallet
                    </button>
                    <button 
                      onClick={() => handleShare(reg)}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}