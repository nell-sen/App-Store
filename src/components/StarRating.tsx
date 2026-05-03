import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface StarRatingProps {
  appId: string;
  initialRating: number;
  initialCount: number;
  readOnly?: boolean;
}

export default function StarRating({ appId, initialRating, initialCount, readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [hasRated, setHasRated] = useState(false);

  const handleRate = async (value: number) => {
    if (readOnly || hasRated) return;

    try {
      const docRef = doc(db, 'apps', appId);
      const newCount = count + 1;
      const newRating = ((rating * count) + value) / newCount;
      
      await updateDoc(docRef, {
        rating: newRating,
        ratingCount: increment(1)
      });

      setRating(newRating);
      setCount(newCount);
      setHasRated(true);
    } catch (err) {
      console.error('Error rating:', err);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly || hasRated}
            onMouseEnter={() => !readOnly && !hasRated && setHover(star)}
            onMouseLeave={() => !readOnly && !hasRated && setHover(0)}
            onClick={() => handleRate(star)}
            className={cn(
              "p-0.5 transition-all outline-none",
              (hover || Math.round(rating)) >= star ? "text-orange-400" : "text-gray-300 dark:text-white/10",
              !readOnly && !hasRated && "hover:scale-125"
            )}
          >
            <Star className={cn("w-4 h-4", (hover || Math.round(rating)) >= star && "fill-current")} />
          </button>
        ))}
        <span className="ml-1 text-[11px] font-bold text-gray-400 dark:text-gray-500">
          {rating.toFixed(1)} ({count})
        </span>
      </div>
      {hasRated && <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Thanks for rating!</p>}
    </div>
  );
}
