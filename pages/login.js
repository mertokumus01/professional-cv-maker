import React from 'react';

export default function Login() {
  return (
    <div className="container">
      <div className="form-card">
        <h1>Login</h1>
        <p>Login form will be implemented here</p>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .form-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 100%;
        }

        h1 {
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }

        p {
          color: #666;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
