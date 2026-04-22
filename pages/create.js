import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { createCV } from '../src/redux/slices/cvSlice';

export default function CreateCV() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { loading, error } = useSelector(state => state.cv);

  const [formData, setFormData] = useState({
    title: '',
    template: 'classic',
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a CV title');
      return;
    }

    const result = await dispatch(createCV({
      title: formData.title,
      template: formData.template,
    }));

    if (result.payload?.id) {
      router.push(`/${result.payload.id}`);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="container">
      <div className="create-card">
        <h1>Create New CV</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="title">CV Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="e.g., Software Engineer CV"
              value={formData.title}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
            <p className="hint">Give your CV a descriptive title</p>
          </div>

          <div className="form-group">
            <label htmlFor="template">Template</label>
            <select
              id="template"
              name="template"
              value={formData.template}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
            </select>
            <p className="hint">Choose a template style for your CV</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => router.push('/cvs')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create CV'}
            </button>
          </div>
        </form>
      </div>

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

        .container {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 40px 20px;
        }

        .create-card {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .create-card h1 {
          margin-bottom: 30px;
          font-size: 28px;
          color: #333;
        }

        .create-form {
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 30px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .hint {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #999;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .cancel-btn,
        .submit-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .create-card {
            padding: 20px;
          }

          .create-card h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}
