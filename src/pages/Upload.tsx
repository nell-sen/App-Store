import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { CATEGORIES } from '@/src/types';
import { CloudUpload, Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle2, Loader2, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminLoginWrapper from '../components/AdminLoginWrapper';

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    apkLink: '',
    thumbnail: '',
    category: CATEGORIES[0],
    screenshots: '', // Comma separated URLs
  });

  useEffect(() => {
    const fetchAppToEdit = async () => {
      if (!editId) return;
      setFetching(true);
      try {
        const docRef = doc(db, 'apps', editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name,
            description: data.description,
            apkLink: data.apkLink,
            thumbnail: data.thumbnail,
            category: data.category || CATEGORIES[0],
            screenshots: data.screenshots ? data.screenshots.join(', ') : '',
          });
        }
      } catch (err) {
        console.error('Error fetching for edit:', err);
        setError('Could not load app data for editing.');
      } finally {
        setFetching(false);
      }
    };
    fetchAppToEdit();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const processedData = {
      ...formData,
      screenshots: formData.screenshots 
        ? formData.screenshots.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      if (editId) {
        const docRef = doc(db, 'apps', editId);
        await updateDoc(docRef, {
          ...processedData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'apps'), {
          ...processedData,
          views: 0,
          downloads: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: serverTimestamp(),
        });
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Error saving document: ', err);
      setError('Failed to save app. Please check your connection.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Editor...</p>
      </div>
    );
  }

  return (
    <AdminLoginWrapper>
      <div className="max-w-2xl mx-auto space-y-10 py-10">
        <header className="space-y-1 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {editId ? 'Edit' : 'Share your'} <span className="text-ios-blue">APK</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-tight">
            {editId ? 'Update existing app information.' : 'Expand the library with high-quality APK links.'}
          </p>
        </header>

        <div className="glass-card rounded-[40px] p-8 sm:p-12 relative overflow-hidden backdrop-blur-[20px]">
          <AnimatePresence>
            {success ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 shadow-sm border border-green-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{editId ? 'Update' : 'Upload'} Successful</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Redirecting to Store</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 italic text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">App Name</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        name="name"
                        type="text"
                        placeholder="e.g. WhatsApp Pro"
                        className="ios-input pl-11"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Category</label>
                      <select
                        name="category"
                        className="ios-input appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] cursor-pointer"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Thumbnail Link</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          required
                          name="thumbnail"
                          type="url"
                          placeholder="https://example.com/icon.png"
                          className="ios-input pl-11"
                          value={formData.thumbnail}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">APK Source URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        name="apkLink"
                        type="url"
                        placeholder="https://direct-link.com/app.apk"
                        className="ios-input pl-11"
                        value={formData.apkLink}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Screenshots Gallery (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="screenshots"
                        type="text"
                        placeholder="URL1, URL2, URL3..."
                        className="ios-input pl-11"
                        value={formData.screenshots}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 ml-4 italic">Separate multiple image URLs with commas.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">App Description</label>
                    <textarea
                      required
                      name="description"
                      rows={4}
                      placeholder="Briefly describe the app features..."
                      className="ios-input resize-none py-4 min-h-[120px]"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ios-blue text-white rounded-2xl py-4 font-bold tracking-tight shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{editId ? 'SAVING...' : 'PUBLISHING...'}</span>
                    </>
                  ) : (
                    <>
                      {editId ? <Save className="w-5 h-5" /> : <CloudUpload className="w-5 h-5" />}
                      <span>{editId ? 'SAVE CHANGES' : 'PUBLISH APK'}</span>
                    </>
                  )
                }
              </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLoginWrapper>
  );
}
