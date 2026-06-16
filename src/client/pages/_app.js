import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Lazy load analytics only on client side
    const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    
    if (gaId) {
      // Dynamic import for analytics
      import('../utils/analyticsClient').then((mod) => {
        const analyticsClient = mod.default || mod;
        analyticsClient.initialize(gaId);
        analyticsClient.pageView(router.pathname, document.title);
      });
    }

    // Initialize heatmap tracking if enabled
    const isHeatmapEnabled = process.env.NEXT_PUBLIC_HEATMAP_ENABLED === 'true';
    if (isHeatmapEnabled) {
      import('../utils/heatmapTracking').then((mod) => {
        const heatmapTracking = mod.default || mod;
        heatmapTracking.initialize(true);

        // Send tracking data on page unload
        const handleBeforeUnload = () => {
          heatmapTracking.sendTrackingData();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      });
    }
  }, []);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
      if (gaId) {
        import('../utils/analyticsClient').then((mod) => {
          const analyticsClient = mod.default || mod;
          if (analyticsClient.isInitialized) {
            analyticsClient.pageView(url, document.title);
          }
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>CV Builder - Create Your Professional CV</title>
        <meta name="description" content="Create your professional CV in minutes" />
        <meta name="theme-color" content="#667eea" />
      </Head>

      <div className="app-container">
        {/* TODO: Add Navigation */}
        <main className="main-content">
          <Component {...pageProps} />
        </main>
        {/* TODO: Add Footer */}
      </div>

      <style global jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          background-color: #fff;
        }

        a {
          color: #667eea;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        button {
          cursor: pointer;
          font-family: inherit;
        }

        input,
        textarea,
        select {
          font-family: inherit;
          font-size: inherit;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          html {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}

export default MyApp;
