import { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.32, 0.72, 0, 1] 
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
