import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCVs } from '../src/redux/slices/cvSlice';

export default function CvList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { cvs, loading, error } = useSelector(state => state.cv);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchCVs());
  }, [isAuthenticated, dispatch, router]);

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>My CVs</h1>
        <Link href="/create">
          <button className="create-btn">+ Create New CV</button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading CVs...</div>
      ) : cvs.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any CVs yet</p>
          <Link href="/create">
            <button className="create-btn-large">Create Your First CV</button>
          </Link>
        </div>
      ) : (
        <div className="cvs-grid">
          {cvs.map(cv => (
            <div key={cv.id} className="cv-card">
              <div className="cv-card-header">
                <h3>{cv.title}</h3>
                <span className={`template-badge ${cv.template}`}>{cv.template}</span>
              </div>
              <div className="cv-card-body">
                <p>Updated: {new Date(cv.lastModified).toLocaleDateString()}</p>
                <p>Views: {cv.viewCount}</p>
              </div>
              <div className="cv-card-actions">
                <Link href={`/${cv.id}`}>
                  <button className="btn-edit">Edit</button>
                </Link>
                <button className="btn-share">Share</button>
                <button className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

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

        .container {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 40px 20px;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          font-size: 32px;
          color: #333;
          margin: 0;
        }

        .create-btn,
        .create-btn-large {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .create-btn:hover,
        .create-btn-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .create-btn-large {
          padding: 16px 40px;
          font-size: 18px;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cvs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cv-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .cv-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .cv-card-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .template-badge {
          padding: 4px 12px;
          background: #eee;
          border-radius: 20px;
          font-size: 12px;
          text-transform: capitalize;
          color: #666;
        }

        .template-badge.classic {
          background: #e3f2fd;
          color: #1976d2;
        }

        .template-badge.modern {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .template-badge.creative {
          background: #fff3e0;
          color: #e65100;
        }

        .cv-card-body {
          padding: 20px;
          color: #666;
          font-size: 14px;
        }

        .cv-card-body p {
          margin: 8px 0;
        }

        .cv-card-actions {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #eee;
        }

        .btn-edit,
        .btn-share,
        .btn-delete {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .btn-share:hover {
          background: #4caf50;
          color: white;
          border-color: #4caf50;
        }

        .btn-delete:hover {
          background: #f44336;
          color: white;
          border-color: #f44336;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }

          .cvs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
