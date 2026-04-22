import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCV, updateCV } from '../src/redux/slices/cvSlice';

export default function EditCV() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { currentCV, loading, error } = useSelector(state => state.cv);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [], education: [], skills: [],
  });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    if (id) dispatch(fetchCV(id));
  }, [id, isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (currentCV) setFormData({
      title: currentCV.title || '',
      personalInfo: currentCV.data?.personalInfo || { fullName: '', email: '', phone: '', location: '', summary: '' },
      experience: currentCV.data?.experience || [],
      education: currentCV.data?.education || [],
      skills: currentCV.data?.skills || [],
    });
  }, [currentCV]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateCV({
      id,
      data: { title: formData.title, data: formData },
    }));
    if (result.payload) alert('CV saved successfully!');
    setSaving(false);
  };

  if (!isAuthenticated) return <div>Redirecting...</div>;
  if (loading) return <div className="loading">Loading CV...</div>;

  return (
    <div className="container">
      <div className="editor">
        <div className="header">
          <h1>Edit CV</h1>
          <button className="btn-back" onClick={() => router.push('/cvs')}>Back</button>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="section">
            <h2>Title</h2>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="CV Title" required />
          </div>
          <div className="section">
            <h2>Personal Info</h2>
            <input type="text" placeholder="Full Name" value={formData.personalInfo.fullName} onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, fullName: e.target.value}})} />
            <input type="email" placeholder="Email" value={formData.personalInfo.email} onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, email: e.target.value}})} />
            <input type="tel" placeholder="Phone" value={formData.personalInfo.phone} onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, phone: e.target.value}})} />
            <input type="text" placeholder="Location" value={formData.personalInfo.location} onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, location: e.target.value}})} />
          </div>
          <div className="actions">
            <button type="button" className="btn-cancel" onClick={() => router.push('/cvs')}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Saving...' : 'Save CV'}</button>
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
      `}</style>
    </div>
  );
}
