import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../src/redux/slices/authSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/cvs');
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

    if (isRegister) {
      if (!formData.firstName || !formData.lastName) {
        alert('Please fill all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      dispatch(register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }));
    } else {
      dispatch(login({
        email: formData.email,
        password: formData.password,
      }));
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h1>{isRegister ? 'Create Account' : 'Login'}</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
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
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              minLength="8"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                minLength="8"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button 
                className="toggle-btn"
                onClick={() => setIsRegister(false)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button 
                className="toggle-btn"
                onClick={() => setIsRegister(true)}
              >
                Register
              </button>
            </>
          )}
        </div>
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
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .form-card {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .form-card h1 {
          margin-bottom: 30px;
          font-size: 28px;
          color: #333;
          text-align: center;
        }

        .auth-form {
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
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
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-toggle {
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .toggle-btn:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 20px;
          }

          .form-card h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}
