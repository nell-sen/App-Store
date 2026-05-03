import React from 'react';
import { ShieldCheck, Settings, Download, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function InstallationGuide() {
  const steps = [
    {
      icon: Download,
      title: 'Download APK',
      desc: 'Klik tombol GET untuk mengunduh file APK dari sumber aman kami.'
    },
    {
      icon: Settings,
      title: 'Izinkan Instalasi',
      desc: 'Jika muncul notifikasi, buka Pengaturan > Keamanan dan aktifkan "Izinkan dari sumber ini".'
    },
    {
      icon: ShieldCheck,
      title: 'Verifikasi',
      desc: 'Sistem Android akan memindai file untuk memastikan keamanan aplikasi.'
    },
    {
      icon: CheckCircle,
      title: 'Selesai',
      desc: 'Ketuk Instal dan tunggu hingga proses selesai. Aplikasi siap digunakan!'
    }
  ];

  return (
    <section className="glass-card rounded-[40px] p-8 sm:p-12 space-y-8">
      <div className="flex items-center gap-3 border-b border-black/5 pb-6">
        <div className="w-10 h-10 bg-ios-blue/10 rounded-full flex items-center justify-center text-ios-blue">
          <Info className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Panduan Instalasi</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="w-12 h-12 shrink-0 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-ios-blue/10 group-hover:text-ios-blue transition-colors">
              <step.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{i + 1}</span>
                {step.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-2xl flex gap-3 text-yellow-700 dark:text-yellow-500 text-xs italic">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <p>Selalu pastikan Anda memiliki ruang penyimpanan yang cukup dan baterai di atas 20% sebelum menginstal APK secara manual.</p>
      </div>
    </section>
  );
}
