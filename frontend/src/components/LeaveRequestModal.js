import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const LEAVE_TYPES = [
  { name: 'Half Day Leave', code: 'HDL' },
  { name: 'Full Day Leave', code: 'FDL' },
  { name: 'Multi-Day Leave', code: 'MDL' },
  { name: 'Time Off Permission', code: 'TOP' },
];

const REASONS = ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Other'];

const STEPS = [
  'Select Leave Type',
  'Select Reason',
  'Attach Medical Prescription',
  'Select Date',
  'Select Supervisor',
  'Summary & Review',
];

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function LeaveRequestModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    leaveType: '',
    reason: '',
    description: '',
    startDate: '',
    endDate: '',
    approvingStaff: '',
  });
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/users/supervisors').then((r) => setSupervisors(r.data.data)).catch(() => {});
  }, []);

  const canProceed = () => {
    if (step === 0) return !!form.leaveType;
    if (step === 1) return !!form.reason;
    if (step === 2) return true; // optional
    if (step === 3) return !!form.startDate && !!form.endDate;
    if (step === 4) return !!form.approvingStaff;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/leaves', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  const selectedSupervisor = supervisors.find((s) => s._id === form.approvingStaff);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
        </div>

        <div className="modal-body">
          {/* Stepper */}
          <div className="stepper">
            {STEPS.map((label, i) => (
              <div key={i} className={`step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                <div className="step-circle">
                  {i < step ? <CheckIcon /> : i + 1}
                </div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Step 0: Leave Type */}
          {step === 0 && (
            <div>
              <div className="leave-type-grid">
                {LEAVE_TYPES.map((lt) => (
                  <div
                    key={lt.code}
                    className={`leave-type-card ${form.leaveType === lt.name ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, leaveType: lt.name })}
                  >
                    <div className="leave-type-name">{lt.name}</div>
                    <div className="leave-type-code">{lt.code}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Reason */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Reason for leave *</label>
                <select className="form-select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                  <option value="">Select a reason</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Additional description (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  placeholder="Provide more details about your leave request…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Medical */}
          {step === 2 && (
            <div>
              <label className="form-label">Medical Prescription (optional)</label>
              <div style={{
                border: '2px dashed var(--gray-200)',
                borderRadius: 'var(--radius)',
                padding: '32px',
                textAlign: 'center',
                color: 'var(--gray-400)',
              }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 12px' }}>
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Upload a medical prescription if applicable</p>
                <p style={{ fontSize: '12px' }}>PNG, JPG, PDF up to 5MB</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} type="button"
                  onClick={() => document.getElementById('med-upload').click()}>
                  Choose file
                </button>
                <input id="med-upload" type="file" style={{ display: 'none' }} accept=".png,.jpg,.jpeg,.pdf" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>
                This step is optional. Click Next to skip.
              </p>
            </div>
          )}

          {/* Step 3: Dates */}
          {step === 3 && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date &amp; Time *</label>
                  <input
                    className="form-input"
                    type={form.leaveType === 'Time Off Permission' ? 'datetime-local' : 'date'}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date &amp; Time *</label>
                  <input
                    className="form-input"
                    type={form.leaveType === 'Time Off Permission' ? 'datetime-local' : 'date'}
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              {form.leaveType === 'Time Off Permission' && (
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '8px' }}>
                  ℹ️ For Time Off Permission, select start and end time on the same day.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Supervisor */}
          {step === 4 && (
            <div>
              <label className="form-label">Select Approving Supervisor *</label>
              {supervisors.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>No supervisors found. Please contact your admin.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {supervisors.map((s) => (
                    <div
                      key={s._id}
                      className={`leave-type-card${form.approvingStaff === s._id ? ' selected' : ''}`}
                      style={{ borderRadius: '10px', textAlign: 'left', padding: '14px 18px' }}
                      onClick={() => setForm({ ...form, approvingStaff: s._id })}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{s.email} · {s.role?.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '15px' }}>Review your request</h3>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '20px' }}>
                <table className="review-table">
                  <tbody>
                    <tr><td>Leave Type</td><td>{form.leaveType}</td></tr>
                    <tr><td>Reason</td><td>{form.reason}</td></tr>
                    {form.description && <tr><td>Description</td><td>{form.description}</td></tr>}
                    <tr><td>Start Date</td><td>{form.startDate ? new Date(form.startDate).toLocaleString() : '—'}</td></tr>
                    <tr><td>End Date</td><td>{form.endDate ? new Date(form.endDate).toLocaleString() : '—'}</td></tr>
                    <tr><td>Supervisor</td><td>{selectedSupervisor?.name || '—'}</td></tr>
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '12px' }}>
                Your request will be submitted and sent for approval. You'll be notified once it's reviewed.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="step-actions">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
