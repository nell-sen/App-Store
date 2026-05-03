import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Edit2, Star, Loader2, Heart } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKApp } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '@/src/context/AdminContext';
import { useFavorites } from '@/src/context/FavoritesContext';
import { cn } from '@/src/lib/utils';

interface APKCardProps {
  app: APKApp;
}

const APKCard: React.FC<APKCardProps> = ({ app }) => {
  const { isAdmin } = useAdmin();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloading) return;
    setDownloading(true);

    const appsPath = 'apps';
    try {
      const docRef = doc(db, appsPath, app.id);
      await updateDoc(docRef, {
        downloads: increment(1)
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = app.apkLink;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${appsPath}/${app.id}`);
      window.location.href = app.apkLink;
    } finally {
      // Keep showing the notification for a moment
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(app.id);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card p-5 rounded-[28px] flex flex-col gap-5 h-full relative group overflow-hidden"
    >
      <AnimatePresence>
        {downloading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/90 dark:bg-ios-bg-dark/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full mb-3"
            />
            <p className="text-sm font-bold text-gray-900 dark:text-white">Menyiapkan Aplikasi...</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Harap Tunggu</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleFavorite}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/50 backdrop-blur-md shadow-sm",
            isFavorite(app.id) ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-400"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite(app.id) && "fill-current")} />
        </button>
        {isAdmin && (
          <Link
            to={`/upload?edit=${app.id}`}
            className="w-8 h-8 bg-white dark:bg-ios-card-dark rounded-full shadow-md border border-black/5 dark:border-white/10 flex items-center justify-center text-ios-blue transition-opacity opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
            title="Edit App"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-[14px] overflow-hidden shadow-md flex-shrink-0">
          <img
            src={app.thumbnail || 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=80'}
            alt={app.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate text-base">
              {app.name}
            </h3>
            <span className="category-pill shrink-0">
              {app.category}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-orange-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[11px] font-bold">{(app.rating || 0).toFixed(1)}</span>
            <span className="text-[10px] text-gray-400 font-medium ml-1">({app.ratingCount || 0})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Downloads</span>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{(app.downloads || 0).toLocaleString()}</span>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/app/${app.id}`}
            className="text-[11px] font-bold text-gray-400 hover:text-ios-blue px-3 py-1 transition-colors"
          >
            DETAILS
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-get disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'GET'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default APKCard;
