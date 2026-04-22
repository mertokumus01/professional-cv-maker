import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../src/redux/slices/authSlice';

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
      });
    }
  }, [isAuthenticated, user, router]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Profile updated successfully');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Profile Information
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="profile-form">
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleProfileChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  disabled={loading}
                  rows="4"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-form">
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 40px 20px;
        }

        .profile-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .profile-header h1 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }

        .logout-btn {
          padding: 10px 20px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #ff5252;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .success-message {
          background-color: #efe;
          color: #3c3;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .tabs {
          display: flex;
          gap: 0;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
        }

        .tab-btn {
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .tab-btn:hover:not(.active) {
          color: #333;
        }

        .profile-form {
          margin-top: 30px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .profile-container {
            padding: 20px;
          }

          .profile-header {
            flex-direction: column;
            gap: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
