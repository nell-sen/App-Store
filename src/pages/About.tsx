import React from 'react';
import { motion } from 'motion/react';
import { Info, Users, Shield, Zap, Heart } from 'lucide-react';

const About: React.FC = () => {
  const team = [
    { name: 'Nell Admin', role: 'Founder & Developer', desc: 'Expert in mobile app security and optimization.' },
    { name: 'Support Team', role: 'Community Manager', desc: 'Ensuring everyone has a smooth experience.' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-ios-blue to-purple-600 rounded-[30px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-ios-blue/30 rotate-3">
          <span className="text-4xl font-black italic tracking-tighter">N</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Tentang NellApps
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Platform distribusi aplikasi Android modern yang berfokus pada kecepatan, keamanan, dan pengalaman pengguna yang mulus.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: 'Aman', desc: 'Semua aplikasi telah melalui tahap pengecekan keamanan.' },
          { icon: Zap, title: 'Cepat', desc: 'Server unduhan optimal untuk kecepatan maksimal.' },
          { icon: Heart, title: 'Gratis', desc: 'Akses ke ribuan mod dan aplikasi premium secara gratis.' }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[32px] text-center space-y-4"
          >
            <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue mx-auto">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card rounded-[40px] p-8 sm:p-12 space-y-10"
      >
        <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-6">
          <Users className="w-6 h-6 text-ios-blue" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tim Kami</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100">{member.name}</h4>
                <p className="text-xs text-ios-blue font-bold uppercase tracking-widest">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-2">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <footer className="text-center py-10 opacity-30">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          &copy; {new Date().getFullYear()} NellApps. Build with Love & iOS Style.
        </p>
      </footer>
    </div>
  );
};

export default About;
