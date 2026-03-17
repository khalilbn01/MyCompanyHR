import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', department: '', position: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-text">MyCompany<span>HR</span></div>
          <div className="auth-subtitle">HR Management System</div>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-desc">Join your team's leave management system</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" type="text" name="name" placeholder="Khalil Ben Nasr"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email" placeholder="you@komutel.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" type="text" name="department" placeholder="Engineering"
                value={form.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input className="form-input" type="text" name="position" placeholder="Developer"
                value={form.position} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="staff">Staff</option>
              <option value="hr">HR / Supervisor</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div style={{ marginTop: '8px' }}>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
