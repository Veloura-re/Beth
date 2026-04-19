'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
import { Plus, Loader2, Printer, QrCode, Trash2, Search, ShieldCheck, Activity } from 'lucide-react';

interface QRCodeData {
  id: string; code?: string; status: string; rewardPoints: number;
  scanCount?: number; campaignName?: string;
  campaign?: { name: string };
}

export default function QRsPage() {
  const [loading, setLoading] = useState(true);
  const [qrs, setQrs] = useState<QRCodeData[]>([]);
  const [selectedQs, setSelectedQs] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedQs(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);
  };

  const printSingle = (qr: QRCodeData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${qr.id}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; background: white; }
            .qr-container { padding: 40px; border: 2px solid #C62E2E; border-radius: 24px; text-align: center; }
            .id { margin-top: 20px; font-size: 14px; font-weight: bold; color: #0A0A0A; letter-spacing: 2px; }
            .campaign { margin-top: 8px; font-size: 12px; color: #666; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div id="qr"></div>
            <div class="id">ID: ${qr.id.toUpperCase()}</div>
            <div class="campaign">${qr.campaign?.name || 'BETH PROTOCOL'}</div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById('qr'), {
              text: "${qr.id}",
              width: 200,
              height: 200,
              colorDark: "#0A0A0A",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
            setTimeout(() => window.print(), 100);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printBatch = () => {
    const codesToPrint = selectedQs.length > 0 ? qrs.filter(q => selectedQs.includes(q.id)) : qrs;
    if (codesToPrint.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gridHtml = codesToPrint.map(qr => `
      <div class="qr-card">
        <div id="qr-${qr.id}"></div>
        <div class="id">${qr.id.slice(0, 8).toUpperCase()}</div>
        <div class="campaign">${qr.campaign?.name || 'BETH'}</div>
      </div>
    `).join('');

    const qrScripts = codesToPrint.map(qr => `
      new QRCode(document.getElementById('qr-${qr.id}'), {
        text: "${qr.id}",
        width: 140,
        height: 140,
        colorDark: "#0A0A0A",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    `).join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes Batch Print</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: white; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
            .qr-card { 
              background: white; 
              border: 3px solid #0A0A0A; 
              border-radius: 16px; 
              padding: 24px; 
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-card > div:first-child { margin: 0 auto; }
            .id { margin-top: 16px; font-size: 12px; font-weight: 900; color: #0A0A0A; letter-spacing: 1px; }
            .campaign { margin-top: 4px; font-size: 10px; color: #C62E2E; font-weight: 700; text-transform: uppercase; }
            @media print { 
              body { padding: 0; }
              .no-print { display: none; } 
            }
            .controls { 
              position: sticky; top: 0; 
              background: #0A0A0A; 
              padding: 16px 24px; 
              margin: -20px -20px 20px -20px;
              display: flex; justify-content: space-between; align-items: center;
              border-bottom: 1px solid #262626;
            }
            .btn { 
              background: #C62E2E; color: white; border: none; 
              padding: 12px 24px; border-radius: 8px; 
              font-weight: 700; cursor: pointer; font-size: 11px;
              text-transform: uppercase; letter-spacing: 1px;
            }
            .btn-secondary {
              background: transparent; border: 1px solid #666; color: #999;
            }
            .info { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="controls no-print">
            <span class="info">Ready to print ${codesToPrint.length} QR codes</span>
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
              <button class="btn" onclick="window.print()">Print Now</button>
            </div>
          </div>
          <div class="grid">
            ${gridHtml}
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            ${qrScripts}
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const [search, setSearch] = useState('');

  const loadQrs = async () => {
    try {
      const data = await fetchWithAuth('/qrs');
      setQrs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadQrs(); }, []);

  const filtered = qrs.filter(q =>
    q && (!search || q.id.toLowerCase().includes(search.toLowerCase()) ||
    (q.campaign?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Protocol Registry</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Secure identifier & Token management</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={printBatch} 
                disabled={qrs.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold shadow-sm hover:bg-white/10 transition-all text-xs text-[#8E8E93] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={18} /> 
                <span>{selectedQs.length > 0 ? `Print Selected (${selectedQs.length})` : 'Print All'}</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                <Plus size={18} /> <span>CREATE IDENTIFIER</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Tokens', value: qrs.length, icon: QrCode },
                { label: 'Verified State', value: qrs.filter(q => q && q.status === 'ACTIVE').length, icon: ShieldCheck },
                { label: 'Network Signals', value: qrs.filter(q => q && (q.scanCount ?? 0) > 0).length, icon: Activity },
                { label: 'Protocol Volume', value: qrs.reduce((s, q) => s + (q?.scanCount ?? 0), 0), icon: Printer },
              ].map((m, i) => (
                <div key={i} className="bg-[#161616] p-6 rounded-2xl border border-[#262626] shadow-xl hover:border-[#C62E2E]/20 transition-all group">
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-[#8E8E93] group-hover:bg-[#C62E2E]/10 group-hover:text-[#C62E2E] transition-colors border border-white/5">
                       <m.icon size={16} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8E8E93]">{m.label}</p>
                  </div>
                  <p className="text-3xl font-sans font-bold text-white tracking-tight">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-white">Secure Data Ledger</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Active Security Tokens</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID or Initiative..."
                    className="pl-12 pr-4 py-3 text-sm bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedQs.length === filtered.length && filtered.length > 0}
                          onChange={() => {
                            if (selectedQs.length === filtered.length) {
                              setSelectedQs([]);
                            } else {
                              setSelectedQs(filtered.map(q => q.id));
                            }
                          }}
                          className="w-4 h-4 accent-[#C62E2E] cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Identifier</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Initiative Context</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Throughput</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Reward Weight</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Protocol State</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="px-10 py-24 text-center">
                        <QrCode size={32} className="mx-auto mb-4 text-white/10" />
                        <p className="text-lg font-sans italic text-white/40 uppercase tracking-tight opacity-60">No identifiers identified in registry.</p>
                      </td></tr>
                    ) : filtered.map((qr) => (
                      <tr key={qr.id} className="hover:bg-white/2 transition-colors group/row">
                        <td className="px-6 py-6">
                          <input
                            type="checkbox"
                            checked={selectedQs.includes(qr.id)}
                            onChange={() => toggleSelection(qr.id)}
                            className="w-4 h-4 accent-[#C62E2E] cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl border border-white/5 flex items-center justify-center group-hover/row:bg-[#C62E2E] transition-all shadow-inner">
                              <QrCode size={18} className="text-[#8E8E93] group-hover/row:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-mono font-bold text-white tracking-tighter opacity-80">{qr.id.slice(0, 14).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                             <span className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors">{qr.campaign?.name ?? 'General Protocol'}</span>
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E93]">Active Initiative</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center font-sans font-bold text-xl text-white">{qr.scanCount ?? 0}</td>
                        <td className="px-6 py-6 text-center font-sans font-bold text-xl text-[#C62E2E]">{qr.rewardPoints}</td>
                        <td className="px-6 py-6 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                             qr.status === 'ACTIVE' 
                               ? 'bg-[#C62E2E]/10 text-[#C62E2E] border-[#C62E2E]/20' 
                               : 'bg-white/5 text-[#8E8E93] border-white/5'
                          }`}>
                            {qr.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => printSingle(qr)}
                              className="w-10 h-10 rounded-xl bg-white/5 text-white/60 hover:bg-[#C62E2E] hover:text-white flex items-center justify-center transition-all border border-white/5"
                              title="Print QR Code"
                            >
                              <Printer size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-[#C62E2E]/10 text-[#C62E2E] hover:bg-[#C62E2E] hover:text-white flex items-center justify-center transition-all border border-[#C62E2E]/20 shadow-lg">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
