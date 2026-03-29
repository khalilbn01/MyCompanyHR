import React, { useState, useEffect } from 'react';
import API from '../utils/api';


export default function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', department: '', position: '', hireDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      setUsers(res.data.data.filter(u => ['staff', 'hr'].includes(u.role)));
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'staff', department: '', position: '' });
    setError(''); setSuccess('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', position: u.position || '', hireDate: u.hireDate ? u.hireDate.split('T')[0] : '' });    setError(''); setSuccess('');
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await API.delete(`/users/${id}`);
      setSuccess(`${name} deleted.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingUser) {
        await API.put(`/users/${editingUser._id}`, form);
        setSuccess('Member updated successfully.');
      } else {
        await API.post('/users', form);
        setSuccess('Member created successfully.');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Team Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Member</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /> Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No team members yet</h3>
            <p>Click "+ Add Member" to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="staff-name">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'hr' ? 'badge-approved' : 'badge-pending'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.department || '—'}</td>
                  <td>{u.position || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id, u.name)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="modal-body">
              <h2 className="modal-title">{editingUser ? 'Edit Member' : 'Add Team Member'}</h2>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Default: password123" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                    <option value="staff">Staff</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hire Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.hireDate || ''}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Position</label>
                    <input className="form-input" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} />
                  </div>
                </div>
                <div className="step-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : editingUser ? 'Save Changes' : 'Create Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}