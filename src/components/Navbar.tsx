import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Search, LogOut, Sun, Moon, Info, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useAdmin } from '@/src/context/AdminContext';
import { useTheme } from '@/src/context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { isAdmin, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Store', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Upload', path: '/upload', icon: Upload },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-8 h-20 sm:top-0 sm:bottom-auto sm:h-16 flex items-center justify-around sm:justify-between glass-nav">
      <div className="max-w-7xl mx-auto w-full flex justify-around sm:justify-between items-center">
        <Link to="/" className="hidden sm:flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-gradient-to-br from-ios-blue to-purple-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-ios-blue/20 ring-1 ring-white/20 dark:ring-white/10"
          >
            <span className="text-white font-black text-xl italic tracking-tighter">N</span>
          </motion.div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              NellApps
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-ios-blue opacity-80">
              Premium Store
            </span>
          </div>
        </Link>

        <div className="flex gap-10 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-all duration-300",
                  isActive ? "text-ios-blue scale-105" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-ios-blue rounded-full shadow-[0_0_12px_rgba(0,122,255,0.8)]"
                    />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
          
          <motion.button 
            onClick={toggleTheme}
            whileTap={{ scale: 0.9, rotate: 15 }}
            className="sm:hidden flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">Mood</span>
          </motion.button>

          {/* Mobile Logout */}
          {isAdmin && (
            <button 
              onClick={logout}
              className="sm:hidden flex flex-col items-center gap-1 text-red-400 hover:text-red-500 active:scale-90 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Out</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <motion.button 
            onClick={toggleTheme}
            animate={{ rotate: theme === 'light' ? 0 : 180 }}
            whileTap={{ scale: 0.8 }}
            className="p-2 text-gray-400 hover:text-ios-blue hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
            title="Toggle Appearance"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </motion.button>

          {isAdmin && (
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all active:scale-90"
              title="Logout Admin"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <Link to="/upload" className="bg-white dark:bg-white/10 dark:text-white border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors">
            + Upload APK
          </Link>
        </div>
      </div>
    </nav>
  );
}
