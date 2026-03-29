import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function ManagerDashboard() {
  const [company, setCompany] = useState(null);
  const [balances, setBalances] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [compRes, balRes] = await Promise.all([
          API.get('/company'),
          API.get('/balance'),
        ]);
        setCompany(compRes.data.data);
        setForm(compRes.data.data);
        setBalances(balRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/company', form);
      setCompany(res.data.data);
      setEditing(false);
      setMsg('Company info updated successfully.');
    } catch (err) {
      setMsg('Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" />Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manager Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : '✏️ Edit Company'}
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Company Info */}
      <div className="table-wrapper" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>
          🏢 Company Information
        </h2>

        {editing ? (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="form-input" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Founded Year</label>
                <input className="form-input" type="number" value={form.foundedYear || ''} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input className="form-input" value={form.registrationNumber || ''} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
              </div>
            </div>

            <h3 style={{ fontWeight: 600, marginTop: '20px', marginBottom: '12px', fontSize: '14px' }}>
              📋 Leave Policy
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Accrual per month (days)</label>
                <input className="form-input" type="number" step="0.25"
                  value={form.leavePolicy?.accrualPerMonth || 1.75}
                  onChange={(e) => setForm({ ...form, leavePolicy: { ...form.leavePolicy, accrualPerMonth: parseFloat(e.target.value) } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max accrual (days)</label>
                <input className="form-input" type="number"
                  value={form.leavePolicy?.maxAccrual || 30}
                  onChange={(e) => setForm({ ...form, leavePolicy: { ...form.leavePolicy, maxAccrual: parseInt(e.target.value) } })} />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Company Name', value: company?.name },
              { label: 'Industry', value: company?.industry },
              { label: 'Email', value: company?.email },
              { label: 'Phone', value: company?.phone },
              { label: 'Address', value: company?.address },
              { label: 'City', value: company?.city },
              { label: 'Country', value: company?.country },
              { label: 'Website', value: company?.website },
              { label: 'Founded', value: company?.foundedYear },
              { label: 'Registration N°', value: company?.registrationNumber },
              { label: 'Total Employees', value: company?.employeeCount },
              { label: 'Leave Accrual/Month', value: `${company?.leavePolicy?.accrualPerMonth || 1.75} days` },
              { label: 'Max Accrual', value: `${company?.leavePolicy?.maxAccrual || 30} days` },
            ].map((item) => (
              <div key={item.label} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--gray-800)' }}>{item.value || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Balances Table */}
      <div className="table-wrapper">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: '15px' }}>💼 Employee Leave Balances</h3>
          <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
            Accrual rate: {company?.leavePolicy?.accrualPerMonth || 1.75} days/month
          </span>
        </div>
        {balances.length === 0 ? (
          <div className="empty-state">
            <h3>No balances yet</h3>
            <p>Click "Run Monthly Accrual" to initialize.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Hire Date</th>
                <th>Months Worked</th>
                <th>Available Balance</th>
                <th>Used</th>
                <th>Total Accrued</th>
                <th>Last Accrual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.employee._id}>
                  <td className="staff-name">{b.employee.name}</td>
                  <td>{b.employee.department || '—'}</td>
                  <td>{b.employee.hireDate ? new Date(b.employee.hireDate).toLocaleDateString('en-GB') : '—'}</td>
                  <td>{b.employee.monthsWorked || 0} months</td>
                  <td>
                    <span style={{ fontWeight: 700, color: b.balance > 5 ? 'var(--teal)' : b.balance > 0 ? '#d97706' : '#dc2626' }}>
                      {b.balance.toFixed(2)} days
                    </span>
                  </td>
                  <td>{b.used.toFixed(2)} days</td>
                  <td>{b.accrued.toFixed(2)} days</td>
                  <td>{b.lastAccrualDate ? new Date(b.lastAccrualDate).toLocaleDateString('en-GB') : '—'}</td>
                  <td>
                    <span className={`badge ${b.balance > 5 ? 'badge-approved' : b.balance > 0 ? 'badge-pending' : 'badge-rejected'}`}>
                      {b.balance > 5 ? 'Good' : b.balance > 0 ? 'Low' : 'Empty'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}