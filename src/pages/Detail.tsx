import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKApp } from '@/src/types';
import { Download, Eye, Calendar, ArrowLeft, ExternalLink, ShieldCheck, Share2, Loader2, FileText, Trash2, Edit3, AlertTriangle, CheckCircle, Image as ImageIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '@/src/components/ui/Skeleton';
import { useAdmin } from '@/src/context/AdminContext';
import { useFavorites } from '@/src/context/FavoritesContext';
import { cn } from '@/src/lib/utils';
import InstallationGuide from '../components/InstallationGuide';
import StarRating from '../components/StarRating';
import CommentsSection from '../components/CommentsSection';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [app, setApp] = useState<APKApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'apps', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setApp({ id: docSnap.id, ...docSnap.data() } as APKApp);
          // Increment views
          await updateDoc(docRef, {
            views: increment(1)
          });
        } else {
          navigate('/');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `apps/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, navigate]);

  const handleShare = async () => {
    if (!app) return;
    
    const shareData = {
      title: `${app.name} - APK Link Store`,
      text: `Download ${app.name} APK now from our store!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleDownload = async () => {
    if (!app || !id || downloading) return;
    setDownloading(true);
    
    const appsPath = 'apps';
    try {
      const docRef = doc(db, appsPath, id);
      await updateDoc(docRef, {
        downloads: increment(1)
      });

      // Update local state to reflect the increment immediately
      setApp(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);

      // Trigger download without navigating or opening new blank tab
      const link = document.createElement('a');
      link.href = app.apkLink;
      // We don't set target="_blank" to avoid the blank page flicker
      // Browser will handle the file download if headers are correct or if it's a direct link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${appsPath}/${id}`);
      // Fallback if the link click fails
      window.location.href = app.apkLink;
    } finally {
      // Keep showing the notification for a moment so user can read it
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const appsPath = 'apps';
    try {
      await deleteDoc(doc(db, appsPath, id));
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${appsPath}/${id}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
        
        <div className="flex flex-col gap-10">
          <Skeleton className="w-full h-[300px] sm:h-[450px] rounded-[40px]" />
          <div className="flex flex-col sm:flex-row justify-between gap-6 px-4">
            <div className="space-y-4 flex-grow">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-14 w-3/4 rounded-xl" />
            </div>
            <div className="flex gap-4 items-center">
              <Skeleton className="h-14 w-44 rounded-full" />
              <Skeleton className="h-14 w-14 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-32 rounded-[28px]" />
            </div>
          ))}
        </div>

        <Skeleton className="h-64 rounded-[40px]" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <AnimatePresence>
        {downloading && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-2xl border border-black/5 dark:border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center text-ios-blue">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Menyiapkan Aplikasi...</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Harap Tunggu Sebentar</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-ios-blue transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to NellApps</span>
        </button>

        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to={`/upload?edit=${app.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full text-xs font-bold text-gray-500 hover:text-ios-blue shadow-sm border border-black/5 dark:border-white/5 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              EDIT
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full text-xs font-bold text-gray-500 hover:text-red-500 shadow-sm border border-black/5 dark:border-white/5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>
        )}
      </div>

      <div className="space-y-10">
        <div className="flex flex-col gap-8">
          {/* Hero Banner Area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full h-[300px] sm:h-[450px] rounded-[40px] overflow-hidden shadow-2xl group"
          >
            <img 
              src={app.thumbnail} 
              alt={app.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 space-y-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="category-pill bg-ios-blue text-white border-transparent">{app.category}</span>
                <StarRating 
                  appId={app.id} 
                  initialRating={app.rating || 0} 
                  initialCount={app.ratingCount || 0} 
                />
              </motion.div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-tight"
              >
                {app.name}
              </motion.h1>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
            <div className="space-y-1">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Release Details</p>
              <p className="text-gray-900 dark:text-gray-100 font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ios-blue" />
                Published on {app.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleDownload}
                className="ios-button bg-ios-blue text-white px-10 py-4 rounded-full font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm tracking-widest"
              >
                <Download className="w-5 h-5" />
                <span>GET APK NOW</span>
              </button>
              <button 
                onClick={() => id && toggleFavorite(id)}
                className={cn(
                  "p-4 glass-card rounded-2xl transition-all active:scale-90",
                  id && isFavorite(id) ? "text-red-500 scale-105" : "text-gray-400 hover:text-red-400"
                )}
                title={id && isFavorite(id) ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
              >
                <Heart className={cn("w-5 h-5", id && isFavorite(id) && "fill-current")} />
              </button>
              <button 
                onClick={handleShare}
                className="p-4 glass-card rounded-2xl text-gray-400 hover:text-ios-blue transition-all active:scale-90 relative"
                title="Share app"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {app.screenshots && app.screenshots.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <ImageIcon className="w-4 h-4 text-ios-blue" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Previews</h3>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0">
              {app.screenshots.map((src, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveScreenshot(src)}
                  className="flex-shrink-0 w-36 sm:w-48 aspect-[9/16] rounded-2xl overflow-hidden glass-card cursor-pointer"
                >
                  <img src={src} className="w-full h-full object-cover" alt={`Screenshot ${i + 1}`} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Views', icon: Eye, value: app.views || 0 },
            { label: 'Downloads', icon: Download, value: app.downloads || 0 },
            { label: 'Security', icon: ShieldCheck, value: 'Verified' },
            { label: 'Platform', icon: Calendar, value: 'Android' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-[28px] flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-ios-blue">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-8 glass-card rounded-[40px] p-8 sm:p-12">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-ios-blue" />
              Description
            </h2>
          </div>
          
          <div className="prose prose-blue max-w-none text-gray-600 dark:text-gray-400 leading-relaxed text-base whitespace-pre-wrap">
            {app.description}
          </div>
          
          <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-ios-blue font-bold text-sm">
              <ExternalLink className="w-4 h-4" />
              <a href={app.apkLink} target="_blank" rel="noreferrer" className="hover:underline tracking-tight">
                Visit Official Source
              </a>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              ID: {id?.slice(0, 8)}...
            </div>
          </div>
        </section>

        <InstallationGuide />

        {app.id && <CommentsSection appId={app.id} />}
      </div>

      <AnimatePresence>
        {activeScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveScreenshot(null)}
            className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={activeScreenshot} 
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              alt="Fullscreen Preview"
            />
            <button className="absolute top-8 right-8 text-white font-bold text-xl select-none">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-ios-card-dark rounded-[40px] p-10 max-w-sm w-full relative z-10 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Delete App?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone. All data for <b>{app.name}</b> will be permanently removed.</p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  {isDeleting ? 'DELETING...' : 'YES, DELETE'}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
