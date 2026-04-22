import React, { useEffect } from 'react';
import Head from 'next/head';
import { Provider, useDispatch } from 'react-redux';
import store from '../src/redux/store';
import { verifyToken } from '../src/redux/slices/authSlice';

// TODO: Import i18n, global styles

function AppContent({ Component, pageProps }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Verify token on app load
    dispatch(verifyToken());
  }, [dispatch]);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
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

function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AppContent Component={Component} pageProps={pageProps} />
    </Provider>
  );
}

export default App;
