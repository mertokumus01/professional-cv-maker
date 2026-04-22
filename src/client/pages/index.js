import React from 'react';

export default function Home() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">Welcome to CV Builder</h1>
        <p className="description">Create your professional CV in minutes</p>

        <div className="grid">
          <a href="/cvs" className="card">
            <h3>My CVs</h3>
            <p>View and manage your CVs</p>
          </a>

          <a href="/create" className="card">
            <h3>Create New CV</h3>
            <p>Start creating your new CV</p>
          </a>

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
