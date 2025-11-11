
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { type PromotionBanner } from '@/lib/types';
import { cn } from '@/lib/utils';
import './TopTickerBanner.css';

const HIDE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function TopTickerBanner() {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const hideUntil = localStorage.getItem('hideTickerUntil');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }

    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          setBanners(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    }
    fetchBanners();
  }, []);

  const handleClose = () => {
    localStorage.setItem('hideTickerUntil', (Date.now() + HIDE_DURATION).toString());
    setIsHidden(true);
  };

  if (isHidden || banners.length === 0) {
    return null;
  }

  const firstBanner = banners[0];
  const bannerContent = (
    <>
      {firstBanner.imageUrl && (
        <Image src={firstBanner.imageUrl} alt={firstBanner.title} width={20} height={20} className="inline-block mr-2" />
      )}
      <span className="font-semibold">{firstBanner.title}</span>
      {firstBanner.text && <span className="hidden sm:inline-block ml-2">{firstBanner.text}</span>}
    </>
  );

  return (
    <div
      className="group/ticker relative w-full overflow-hidden text-sm"
      style={{
        backgroundColor: firstBanner.backgroundColor || 'hsl(var(--primary))',
        color: firstBanner.textColor || 'hsl(var(--primary-foreground))',
      }}
    >
      <div className="ticker-track flex">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-shrink-0 whitespace-nowrap px-8 py-2">
            {firstBanner.linkUrl ? (
              <Link href={firstBanner.linkUrl} className="hover:underline">
                {bannerContent}
              </Link>
            ) : (
              <span>{bannerContent}</span>
            )}
          </div>
        ))}
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
