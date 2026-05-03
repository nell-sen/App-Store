import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKApp, CATEGORIES, APKCategory } from '@/src/types';
import APKCard from '@/src/components/APKCard';
import BannerSlider from '@/src/components/BannerSlider';
import Skeleton from '@/src/components/ui/Skeleton';
import { Search, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const PAGE_SIZE = 9;

export default function Home() {
  const [apps, setApps] = useState<APKApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<APKCategory | 'All'>('All');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    const appsPath = 'apps';
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, appsPath), 
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
        const snapshot = await getDocs(q);
        const appsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as APKApp[];
        
        setApps(appsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, appsPath);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;
    
    const appsPath = 'apps';
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, appsPath),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      const newApps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as APKApp[];
      
      setApps(prev => [...prev, ...newApps]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, appsPath);
    } finally {
      setLoadingMore(false);
    }
  };

  const trendingApps = useMemo(() => {
    return [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
  }, [apps]);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-br from-ios-blue to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-ios-blue/30">
               <span className="text-white font-black text-2xl italic tracking-tighter">N</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-black tracking-tighter bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent leading-none">
              NellApps
            </h1>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            Premium APK Marketplace <span className="mx-2 text-ios-blue">•</span> High Speed Downloads
          </p>
        </motion.div>
        
        <div className="flex gap-2">
          {['Tools', 'Games', 'Mod'].map(tag => (
            <span key={tag} className="category-pill group">
              <Sparkles className="w-3 h-3 inline-block mr-1 text-ios-blue group-hover:animate-pulse" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Featured Banner Slider */}
      {!loading && trendingApps.length > 0 && searchQuery === '' && selectedCategory === 'All' && (
        <BannerSlider apps={trendingApps} />
      )}

      {/* Search Bar - Integrated style */}
      <div className="max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-ios-blue transition-colors" />
          <input
            type="text"
            placeholder="Search Apps, Games, and more"
            className="ios-input pl-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs - iOS Style */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setSelectedCategory('All')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
            selectedCategory === 'All' 
              ? "bg-white dark:bg-white/10 text-ios-blue shadow-sm" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          All
        </button>
        {CATEGORIES.slice(0, 4).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              selectedCategory === cat 
                ? "bg-white dark:bg-white/10 text-ios-blue shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-[28px] flex flex-col gap-5 h-full opacity-60">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-[14px] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="space-y-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded-lg bg-gray-200 dark:bg-white/10" />
                  <Skeleton className="h-6 w-14 rounded-[20px] bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredApps.map((app, index) => (
            <div key={app.id} ref={index === filteredApps.length - 1 ? lastItemRef : null}>
              <APKCard app={app} />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="py-32 glass-card rounded-[40px] text-center border-dashed border-gray-300">
          <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No apps found</h3>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Try another search term</p>
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-ios-blue" />
        </div>
      )}
    </div>
  );
}
