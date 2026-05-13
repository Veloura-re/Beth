'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getQRCodes } from '@/lib/api';
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
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: 'Courier New', monospace; background: white; }
            .qr-container { padding: 40px; border: 2px solid #0A0A0A; text-align: center; }
            .brand { font-size: 12px; font-weight: 900; letter-spacing: 4px; color: #000000; margin-bottom: 24px; text-transform: uppercase; }
            .qr-wrap { display: inline-block; padding: 16px; border: 1px solid #e5e5e5; }
            .id { margin-top: 20px; font-size: 13px; font-weight: bold; color: #0A0A0A; letter-spacing: 3px; text-transform: uppercase; }
            .campaign { margin-top: 6px; font-size: 12px; color: #666; letter-spacing: 1px; }
            .footer { margin-top: 16px; font-size: 10px; color: #999; letter-spacing: 2px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="brand">BETH REWARDS</div>
            <div class="qr-wrap"><div id="qr"></div></div>
            <div class="id">ID: ${qr.id.toUpperCase()}</div>
            <div class="campaign">${qr.campaign?.name || 'BETH PROTOCOL'}</div>
            <div class="footer">SCAN TO EARN REWARDS</div>
          </div>
          <script>
            function loadQR() {
              new QRCode(document.getElementById('qr'), {
                text: "${qr.id}",
                width: 200,
                height: 200,
                colorDark: "#0A0A0A",
                colorLight: "#ffffff",
                correctLevel: 2
              });
              setTimeout(() => window.print(), 400);
            }
          <\/script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" onload="loadQR()"></script>
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
        <div class="brand">BETH REWARDS</div>
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
          <title>QR Codes Batch Print — BETH</title>
          <style>
            body { margin: 0; padding: 20px; font-family: 'Courier New', monospace; background: white; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
            .qr-card { 
              background: white; 
              border: 2px solid #0A0A0A; 
              padding: 20px; 
              text-align: center;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .brand { font-size: 9px; font-weight: 900; letter-spacing: 3px; color: #000000; margin-bottom: 12px; }
            .qr-card > div:nth-child(2) { margin: 0 auto; }
            .id { margin-top: 12px; font-size: 11px; font-weight: 900; color: #0A0A0A; letter-spacing: 2px; }
            .campaign { margin-top: 4px; font-size: 10px; color: #000000; font-weight: 700; text-transform: uppercase; }
            @media print { 
              body { padding: 0; }
              .no-print { display: none !important; }
              @page { margin: 10mm; }
            }
            .controls { 
              position: sticky; top: 0; 
              background: #FBFBFD; 
              padding: 16px 24px; 
              margin: -20px -20px 20px -20px;
              display: flex; justify-content: space-between; align-items: center;
              border-bottom: 1px solid #D2D2D7;
            }
            .btn { 
              background: #000000; color: white; border: none; 
              padding: 12px 24px;
              font-weight: 700; cursor: pointer; font-size: 13px;
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
          <script>
            function renderAll() {
              ${qrScripts}
              setTimeout(() => {/* ready */}, 100);
            }
          <\/script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" onload="renderAll()"></script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const [search, setSearch] = useState('');

  const loadQrs = async () => {
    try {
      const data = await getQRCodes(null);
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
      <div className="flex bg-[#FBFBFD] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#FBFBFD] min-h-screen font-sans text-[#1D1D1F]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2 text-black">QR Codes</h1>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B]">Manage your campaign QR codes and scan history.</p>
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
              <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                <Plus size={18} /> <span>CREATE QR CODE</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total QR Codes', value: qrs.length, icon: QrCode },
                { label: 'Active', value: qrs.filter(q => q && q.status === 'ACTIVE').length, icon: ShieldCheck },
                { label: 'Scanned', value: qrs.filter(q => q && (q.scanCount ?? 0) > 0).length, icon: Activity },
                { label: 'Total Scans', value: qrs.reduce((s, q) => s + (q?.scanCount ?? 0), 0), icon: Printer },
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#D2D2D7] shadow-sm hover:border-black/20 transition-all group">
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] group-hover:bg-black group-hover:text-white transition-colors border border-black/5">
                       <m.icon size={16} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">{m.label}</p>
                  </div>
                  <p className="text-3xl font-sans font-bold text-black tracking-tight">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#D2D2D7] rounded-3xl overflow-hidden shadow-sm">
              <div className="px-10 py-8 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-black">QR Code List</h3>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B] mt-1">Manage your QR codes</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID or campaign..."
                    className="pl-12 pr-4 py-3 text-sm bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-black/10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F5F5F7]">
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
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B]">QR Code ID</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B]">Campaign</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-center">Scans</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-center">Points</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-center">Status</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="px-10 py-24 text-center">
                        <QrCode size={32} className="mx-auto mb-4 text-black/10" />
                        <p className="text-lg font-sans italic text-[#86868B] uppercase tracking-tight">No QR codes found.</p>
                      </td></tr>
                    ) : filtered.map((qr) => (
                      <tr key={qr.id} className="hover:bg-[#F5F5F7] transition-colors group/row">
                        <td className="px-6 py-6">
                          <input
                            type="checkbox"
                            checked={selectedQs.includes(qr.id)}
                            onChange={() => toggleSelection(qr.id)}
                            className="w-4 h-4 accent-black cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl border border-black/5 flex items-center justify-center group-hover/row:bg-black transition-all shadow-inner">
                              <QrCode size={18} className="text-[#1D1D1F] group-hover/row:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-mono font-bold text-black tracking-tighter opacity-80">{qr.id.slice(0, 14).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                             <span className="font-sans font-bold text-lg text-black group-hover/row:text-black transition-colors">{qr.campaign?.name ?? 'General'}</span>
                             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#86868B]">Active Campaign</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center font-sans font-bold text-xl text-black">{qr.scanCount ?? 0}</td>
                        <td className="px-6 py-6 text-center font-sans font-bold text-xl text-black">{qr.rewardPoints}</td>
                        <td className="px-6 py-6 text-center">
                          <span className={`text-[11px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                             qr.status === 'ACTIVE' 
                               ? 'bg-black/10 text-black border-black/20' 
                               : 'bg-[#F5F5F7] text-[#86868B] border-black/5'
                          }`}>
                            {qr.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => printSingle(qr)}
                              className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] hover:bg-black hover:text-white flex items-center justify-center transition-all border border-black/5"
                              title="Print QR Code"
                            >
                              <Printer size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-black/5 text-[#86868B] hover:bg-black hover:text-white flex items-center justify-center transition-all border border-black/10 shadow-sm">
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
