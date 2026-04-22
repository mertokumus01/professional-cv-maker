import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/cvs');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">CV Builder</h2>
          <div className="nav-links">
            <Link href="/login">
              <button className="nav-btn">Login</button>
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>Create Your Professional CV Online</h1>
          <p>Build a stunning, ATS-optimized CV in minutes. Choose from multiple templates and share with ease.</p>
          <div className="hero-buttons">
            <Link href="/login">
              <button className="btn-primary">Get Started Free</button>
            </Link>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="features-container">
          <h2>Why Choose CV Builder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Easy to Use</h3>
              <p>Simple and intuitive interface for creating professional CVs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Multiple Templates</h3>
              <p>Choose from various professionally designed templates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Easy Sharing</h3>
              <p>Share your CV with recruiters and employers instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>ATS Optimized</h3>
              <p>Your CV will be recognized by Applicant Tracking Systems</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 CV Builder. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .navbar {
          background: rgba(0, 0, 0, 0.2);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-btn {
          padding: 10px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .nav-btn:hover {
          transform: translateY(-2px);
        }

        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 20px;
          text-align: center;
        }

        .hero-content h1 {
          font-size: 48px;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .hero-content p {
          font-size: 20px;
          margin-bottom: 30px;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary {
          padding: 14px 40px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        .features {
          background: white;
          color: #333;
          padding: 80px 20px;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-container h2 {
          font-size: 36px;
          margin-bottom: 50px;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .feature-card {
          text-align: center;
          padding: 30px;
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #667eea;
        }

        .feature-card p {
          color: #666;
          line-height: 1.6;
        }

        .footer {
          background: rgba(0, 0, 0, 0.3);
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-content p {
          margin: 0;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 36px;
          }

          .hero-content p {
            font-size: 18px;
          }

          .features-container h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/cvs');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">CV Builder</h2>
          <div className="nav-links">
            <Link href="/login">
              <button className="nav-btn">Login</button>
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>Create Your Professional CV Online</h1>
          <p>Build a stunning, ATS-optimized CV in minutes. Choose from multiple templates and share with ease.</p>
          <div className="hero-buttons">
            <Link href="/login">
              <button className="btn-primary">Get Started Free</button>
            </Link>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="features-container">
          <h2>Why Choose CV Builder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Easy to Use</h3>
              <p>Simple and intuitive interface for creating professional CVs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Multiple Templates</h3>
              <p>Choose from various professionally designed templates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Easy Sharing</h3>
              <p>Share your CV with recruiters and employers instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>ATS Optimized</h3>
              <p>Your CV will be recognized by Applicant Tracking Systems</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 CV Builder. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {

          <a href="/profile" className="card">
            <h3>Profile</h3>
            <p>Update your profile information</p>
          </a>

          <a href="/docs" className="card">
            <h3>Documentation</h3>
            <p>Learn how to use CV Builder</p>
          </a>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          color: white;
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .description {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.5rem;
          margin: 1rem 0 3rem;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          max-width: 1200px;
          width: 100%;
          padding: 0 1rem;
        }

        .card {
          color: inherit;
          padding: 1.5rem;
          text-align: left;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: color 200ms, border-color 200ms;
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          color: white;
        }

        .card:hover {
          border-color: #667eea;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 600px) {
          .title {
            font-size: 2rem;
          }

          .description {
            font-size: 1rem;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
