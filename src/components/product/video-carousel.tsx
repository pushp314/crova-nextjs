'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

const videos = [
  { id: 1, src: '/assets/social/customer-1.mp4' },
  { id: 2, src: '/assets/social/customer-2.mp4' },
  { id: 3, src: '/assets/social/customer-3.mp4' },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full">
      {/* Video Container */}
      <div 
        className="relative overflow-hidden rounded-xl shadow-2xl" 
        style={{ 
          height: 'calc(90vh - 4rem - var(--banner-height, 0px) - 8rem)',
          maxHeight: '650px'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Card className="overflow-hidden h-full">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/assets/products/featured-1.jpg"
              >
                <source src={videos[currentIndex].src} type="video/mp4" />
              </video>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-primary'
                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
