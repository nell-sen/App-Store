import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKApp } from '@/src/types';
import APKCard from '@/src/components/APKCard';
import { useFavorites } from '@/src/context/FavoritesContext';
import { Heart, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [apps, setApps] = useState<APKApp[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setApps([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const appsPath = 'apps';
      try {
        // Firestore 'in' query has a limit of 10-30 IDs usually, 
        // but for a simple wishlist it's standard practice or client-side filter if small.
        // We will use 'in' up to 30 items for now.
        const favoriteIds = favorites.slice(0, 30);
        const q = query(collection(db, appsPath), where(documentId(), 'in', favoriteIds));
        const snapshot = await getDocs(q);
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as APKApp[];
        
        // Preserve sort order or just sort by name? Let's keep Firestore results
        setApps(appsData);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, appsPath);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  return (
    <div className="space-y-12 py-10">
      <header className="space-y-2 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Wishlist</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Aplikasi dan game yang kamu sukai, tersimpan di sini.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin" />
            <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Memuat Wishlist kamu...</span>
        </div>
      ) : apps.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {apps.map((app) => (
            <APKCard key={app.id} app={app} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-32 bg-gray-50 dark:bg-white/5 rounded-[50px] border-2 border-dashed border-gray-200 dark:border-white/10 space-y-8">
          <div className="w-24 h-24 bg-red-500/5 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-300 mx-auto">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white font-black text-xl">Wishlist masih kosong</p>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.1em]">Belum ada aplikasi yang kamu tandai.</p>
          </div>
          <Link 
            to="/" 
            className="ios-button inline-flex bg-ios-blue text-white px-8 py-3 rounded-full font-bold text-sm items-center gap-2"
          >
            Jelajahi Store <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {favorites.length > 0 && apps.length > 0 && (
         <div className="pt-10 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-bold uppercase tracking-widest">{apps.length} Aplikasi Disukai</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Tersimpan di Perangkat Ini</span>
            </div>
         </div>
      )}
    </div>
  );
}
