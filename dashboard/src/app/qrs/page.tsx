'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Download, 
  Layers, 
  MapPin,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import QRCode from 'react-qr-code';

export default function QRGeneratorPage() {
  const [qrId, setQrId] = useState('BETH-7788-2233');
  
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">QR Generator</h2>
            <p className="text-muted-foreground">Create and manage QR codes for your campaigns.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              New QR Code
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Campaign</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50">
                  <option>Summer Hit Promo</option>
                  <option>Mega City Launch</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Assign Painter</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50">
                  <option>Alex Smith</option>
                  <option>Maria Garcia</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Location Name</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="e.g. Times Square North"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Reward Points</label>
                  <div className="relative">
                    <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="number" 
                      defaultValue={10}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Expiration</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button className="glow-btn flex-1 py-4">Generate Single QR</button>
              <button className="glass flex-1 py-4 flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" /> Batch Generate
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-6">
            <div className="glass p-8 flex flex-col items-center justify-center text-center aspect-square flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(255,0,51,0.5)]" />
              
              <div className="bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6">
                <QRCode value={qrId} size={200} />
              </div>
              
              <h4 className="text-xl font-bold mb-1">{qrId}</h4>
              <p className="text-muted-foreground text-sm max-w-[240px]">This QR is linked to <strong>Alex Smith</strong> for the <strong>Summer Hit Promo</strong>.</p>
              
              <button className="mt-8 flex items-center gap-2 text-primary font-bold hover:underline">
                <Download className="w-5 h-5" /> Download SVG
              </button>
            </div>
            
            <div className="glass p-6">
              <h4 className="font-bold mb-4">Print Options</h4>
              <div className="flex gap-3">
                <button className="flex-1 glass p-3 text-sm text-center hover:border-primary/30 transition-all">A4 Sticker Sheet (12x)</button>
                <button className="flex-1 glass p-3 text-sm text-center hover:border-primary/30 transition-all">Individual PDF</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
