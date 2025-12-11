'use client';

/**
 * Service Worker Registration
 * 
 * Registers the service worker for PWA/offline support.
 * Only runs in production and on supported browsers.
 */

export function registerServiceWorker() {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Only register in production
    if (process.env.NODE_ENV !== 'production') return;

    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000); // Every hour

        } catch {
            // Service worker registration failed silently
        }
    });
}

/**
 * Unregister all service workers
 * Useful for debugging or when updating the app
 */
export async function unregisterServiceWorker() {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
        await registration.unregister();
    }
}
