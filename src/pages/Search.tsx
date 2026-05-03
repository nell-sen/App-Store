import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKApp } from '@/src/types';
import APKCard from '@/src/components/APKCard';
import { Search as SearchIcon, X, Loader2, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SEARCH_PAGE_SIZE = 9;

export default function Search() {
  const [apps, setApps] = useState<APKApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('search_history') || '[]');
    } catch {
      return [];
    }
  });
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && searchQuery.trim() !== '') {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, searchQuery]);

  const performSearch = async (queryStr: string, isInitial = true) => {
    if (!queryStr.trim()) {
      setApps([]);
      setHasMore(false);
      return;
    }

    if (isInitial) {
      setLoading(true);
      setApps([]);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }

    const appsPath = 'apps';
    try {
      // Use client-side filter for better substring match as Firestore prefix search is limited
      // But we still paginate the fetch if dataset grows
      const q = isInitial
        ? query(collection(db, appsPath), orderBy('createdAt', 'desc'))
        : (lastDoc ? query(collection(db, appsPath), orderBy('createdAt', 'desc'), startAfter(lastDoc)) : null);

      if (!q) return;

      // Note: For real scale, we'd need a search index like Algolia.
      // Here we fetch more and filter until we reach PAGE_SIZE or end.
      const snapshot = await getDocs(q);
      const allFetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as APKApp[];
      
      const filtered = allFetched.filter(app => 
        app.name.toLowerCase().includes(queryStr.toLowerCase()) ||
        app.category.toLowerCase().includes(queryStr.toLowerCase())
      );

      // Simulating pagination of filtered results
      const newAppsSlice = isInitial ? filtered.slice(0, SEARCH_PAGE_SIZE) : filtered.slice(0, SEARCH_PAGE_SIZE);
      
      if (isInitial) {
        setApps(filtered.slice(0, SEARCH_PAGE_SIZE));
      } else {
        setApps(prev => [...prev, ...filtered.slice(0, SEARCH_PAGE_SIZE)]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length > 0 && filtered.length > SEARCH_PAGE_SIZE);

      if (isInitial && queryStr.trim().length > 0) {
        addToHistory(queryStr.trim());
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, appsPath);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    // In this simplified client-side filter over paginated fetch,
    // loadMore would just fetch next raw batch and filter.
    // For simplicity with Firestore limited search:
    if (!hasMore) return;
    performSearch(searchQuery, false);
  };

  const addToHistory = (q: string) => {
    setHistory(prev => {
      const next = [q, ...prev.filter(h => h !== q)].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  const removeHistoryItem = (q: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h !== q);
      localStorage.setItem('search_history', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch(searchQuery);
      } else {
        setApps([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="space-y-12 py-10">
      <header className="space-y-8 max-w-3xl mx-auto text-center sm:text-left">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Search</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Temukan ribuan aplikasi dan game di NellApps.</p>
        </div>

        <div className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-blue transition-transform group-focus-within:scale-110" />
          <input
            autoFocus
            type="text"
            placeholder="Cari Aplikasi, Game, Mod..."
            className="ios-input pl-16 pr-14 py-7 text-xl shadow-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* History Chips */}
        {history.length > 0 && !searchQuery && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <History className="w-3 h-3" />
                Pencarian Terakhir
              </div>
              <button 
                onClick={clearHistory}
                className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Hapus Semua
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {history.map((item, i) => (
                <div key={i} className="group relative">
                  <button
                    onClick={() => setSearchQuery(item)}
                    className="px-5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-ios-blue/10 hover:text-ios-blue rounded-2xl text-sm font-bold transition-all border border-transparent hover:border-ios-blue/20"
                  >
                    {item}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-ios-blue/10 border-t-ios-blue rounded-full animate-spin" />
            <SearchIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-ios-blue animate-pulse" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mencari di NellApps Store</span>
        </div>
      ) : searchQuery.trim() === '' ? (
        <div className="text-center py-32 space-y-6 opacity-40">
          <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-[50px] flex items-center justify-center text-gray-300 mx-auto">
            <SearchIcon className="w-10 h-10" />
          </div>
          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.3em]">Ketik sesuatu untuk mulai mencari</p>
        </div>
      ) : apps.length > 0 ? (
        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {apps.map((app, index) => (
              <div key={app.id} ref={index === apps.length - 1 ? lastItemRef : null}>
                <APKCard app={app} />
              </div>
            ))}
          </motion.div>
          {loadingMore && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-ios-blue" />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-32 glass-card rounded-[40px] border-dashed border-gray-300/50">
          <p className="text-gray-900 dark:text-white font-black text-xl mb-1">No results found for "{searchQuery}"</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Try different keywords or check spelling</p>
        </div>
      )}
    </div>
  );
}
