
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { type PromotionBanner } from '@/lib/types';
import './TopTickerBanner.css';

const HIDE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const BANNER_HEIGHT = 40; // Height of the banner in pixels

export default function TopTickerBanner() {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isHidden, setIsHidden] = useState(false); // Changed default to false
  const [isLoading, setIsLoading] = useState(true);

  // Update CSS variable for main content margin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldShow = !isHidden && banners.length > 0 && !isLoading;
      document.documentElement.style.setProperty(
        '--banner-height',
        shouldShow ? `${BANNER_HEIGHT}px` : '0px'
      );
    }
  }, [isHidden, banners.length, isLoading]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          // Ensure data is an array
          if (Array.isArray(data)) {
            setBanners(data);

            // Check localStorage AFTER fetching banners
            // Only hide if there are banners AND user has clicked close
            if (data.length > 0) {
              const hideUntil = localStorage.getItem('hideTickerUntil');
              if (hideUntil && Date.now() < parseInt(hideUntil, 10)) {
                setIsHidden(true);
              } else {
                setIsHidden(false);
                // Clear old localStorage entry if expired
                if (hideUntil) {
                  localStorage.removeItem('hideTickerUntil');
                }
              }
            }
          } else {
            setBanners([]);
          }
        } else {
          setBanners([]);
        }
      } catch {
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const handleClose = () => {
    const hideUntil = Date.now() + HIDE_DURATION;
    localStorage.setItem('hideTickerUntil', hideUntil.toString());
    setIsHidden(true);
  };

  // Don't render while loading or if hidden or no banners
  if (isLoading || isHidden || banners.length === 0) {
    return null;
  }

  const firstBanner = banners[0];
  const bannerContent = (
    <div className="flex items-center">
      {firstBanner.imageUrl && (
        // Using img tag instead of Next.js Image to avoid optimization issues with dynamic URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={firstBanner.imageUrl}
          alt=""
          width={20}
          height={20}
          className="inline-block mr-2 rounded-sm"
        />
      )}
      <span className="font-semibold">{firstBanner.title}</span>
      {firstBanner.text && <span className="hidden sm:inline-block ml-2">{firstBanner.text}</span>}
    </div>
  );

  const TickerItem = () => (
    <div className="flex-shrink-0 whitespace-nowrap px-8 py-2">
      {firstBanner.linkUrl ? (
        <Link href={firstBanner.linkUrl} className="hover:underline">
          {bannerContent}
        </Link>
      ) : (
        <span>{bannerContent}</span>
      )}
    </div>
  );

  return (
    <div
      className="group/ticker fixed top-16 left-0 right-0 z-40 w-full overflow-hidden text-sm transition-all duration-300 backdrop-blur supports-[backdrop-filter]:bg-opacity-95"
      style={{
        backgroundColor: firstBanner.backgroundColor || 'hsl(var(--primary))',
        color: firstBanner.textColor || 'hsl(var(--primary-foreground))',
      }}
      role="region"
      aria-label={`Promotional Announcement: ${firstBanner.title}`}
      aria-live="polite"
    >
      <div className="ticker-track flex">
        {/* Duplicate content to create a seamless loop */}
        <TickerItem />
        <TickerItem />
        <TickerItem />
        <TickerItem />
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/20"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
