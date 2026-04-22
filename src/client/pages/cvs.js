import React from 'react';

export default function CvList() {
  return (
    <div className="container">
      <h1>My CVs</h1>
      <p>Your CVs will appear here</p>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          color: #333;
          margin-bottom: 1rem;
        }

        p {
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
