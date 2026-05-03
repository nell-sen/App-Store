import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { APKComment } from '@/src/types';
import { MessageSquare, Send, User, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentsSectionProps {
  appId: string;
}

export default function CommentsSection({ appId }: CommentsSectionProps) {
  const [comments, setComments] = useState<APKComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(localStorage.getItem('comment_username') || '');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const commentsPath = 'comments';
    const q = query(
      collection(db, commentsPath),
      where('appId', '==', appId),
      limit(100) // Increase limit since we are sorting client-side
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as APKComment[];
      
      // Client-side sort to bypass missing composite index
      const sortedDocs = docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setComments(sortedDocs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, commentsPath);
    });

    return () => unsubscribe();
  }, [appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !username.trim() || submitting) return;

    const commentsPath = 'comments';
    setSubmitting(true);
    try {
      localStorage.setItem('comment_username', username);
      await addDoc(collection(db, commentsPath), {
        appId,
        username: username.trim(),
        text: text.trim(),
        createdAt: serverTimestamp()
      });
      setText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, commentsPath);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <section className="space-y-8 glass-card rounded-[40px] p-8 sm:p-12">
      <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-6">
        <MessageSquare className="w-6 h-6 text-ios-blue" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review & Forum</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Nama Anda"
                className="ios-input pl-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Your Comment</label>
          <textarea
            required
            placeholder="Bagikan pendapat Anda tentang aplikasi ini..."
            className="ios-input min-h-[100px] py-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="ios-button w-full sm:w-auto px-10 bg-ios-blue text-white rounded-full font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
          KIRIM KOMENTAR
        </button>
      </form>

      <div className="space-y-6 pt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-ios-blue" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-gray-400 font-medium">Belum ada komentar.</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Jadilah yang pertama mengulas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.username}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-10">
                  {comment.text}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
