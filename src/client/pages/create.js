import React from 'react';

export default function CreateCV() {
  return (
    <div className="container">
      <h1>Create New CV</h1>
      <p>CV creation form will be implemented here</p>

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
