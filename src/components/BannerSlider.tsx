import React, { useState, useEffect, useCallback } from 'react';
import { APKApp } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BannerSliderProps {
  apps: APKApp[];
}

export default function BannerSlider({ apps }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const featuredApps = apps.slice(0, 10); // Use up to 10 latest or trending apps

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  }, [featuredApps.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  }, [featuredApps.length]);

  useEffect(() => {
    if (!isAutoPlaying || featuredApps.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, featuredApps.length]);

  if (featuredApps.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[300px] sm:h-[450px] rounded-[40px] overflow-hidden group shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={featuredApps[currentIndex].id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="absolute inset-0"
        >
          <img 
            src={featuredApps[currentIndex].thumbnail} 
            alt={featuredApps[currentIndex].name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-ios-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Featured
                </span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  {featuredApps[currentIndex].category}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">
                {featuredApps[currentIndex].name}
              </h2>
              <p className="text-white/70 text-sm max-w-xl line-clamp-2">
                {featuredApps[currentIndex].description}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to={`/app/${featuredApps[currentIndex].id}`}
                className="ios-button inline-flex bg-white text-black hover:bg-ios-blue hover:text-white transition-all px-8 py-3 rounded-full font-bold text-sm"
              >
                Get Now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredApps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
