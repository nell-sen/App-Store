import React, { useState } from 'react';
import { useAdmin } from '@/src/context/AdminContext';
import { Lock, Key, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginWrapperProps {
  children: React.ReactNode;
}

export default function AdminLoginWrapper({ children }: AdminLoginWrapperProps) {
  const { isAdmin, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[40px] text-center space-y-8"
      >
        <div className="w-16 h-16 bg-ios-blue/10 rounded-3xl flex items-center justify-center text-ios-blue mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Admin Access</h2>
          <p className="text-sm text-gray-400">Please enter the security password to manage the store.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              className="ios-input pl-11"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-semibold justify-center italic">
              <AlertCircle className="w-4 h-4" />
              Incorrect password
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-ios-blue text-white py-3 rounded-2xl font-bold active:scale-[0.98] transition-all"
          >
            LOGIN
          </button>
        </form>
      </motion.div>
    </div>
  );
}
