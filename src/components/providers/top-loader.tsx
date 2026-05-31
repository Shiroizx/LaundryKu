'use client'

import { useEffect } from 'react'
import NextTopLoader from 'nextjs-toploader'
import NProgress from 'nprogress'

export function GlobalTopLoader() {
  useEffect(() => {
    let activeRequests = 0;

    const handleStart = () => {
      if (activeRequests === 0) {
        NProgress.start()
      }
      activeRequests++;
    };

    const handleComplete = () => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        NProgress.done()
      }
    };

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const options = args[1] || {};
      const method = (options.method || 'GET').toUpperCase();
      
      // Intercept POST, PUT, PATCH, DELETE which are common for Server Actions and CRUD
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
      
      if (isMutation) {
        handleStart();
      }

      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        if (isMutation) {
          handleComplete();
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <NextTopLoader 
      color="#0ea5e9"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9"
    />
  )
}
