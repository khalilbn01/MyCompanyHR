import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STEPS_DAY = ['Select Leave Type', 'Select Reason', 'Attach Medical', 'Select Date', 'Select Supervisor', 'Summary & Review'];
const STEPS_TOP = ['Select Leave Type', 'Select Reason', 'Select Date & Time', 'Select Supervisor', 'Summary & Review'];

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function LeaveRequestModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [leaveCategory, setLeaveCategory] = useState(''); // 'days' or 'timeoff'
  const [form, setForm] = useState({
    leaveType: '',
    reason: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    approvingStaff: '',
  });
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/users/supervisors').then((r) => {
      const all = r.data.data;
      if (user?.role === 'hr') {
        setSupervisors(all.filter(s => s.role === 'manager' || s.role === 'admin'));
      } else if (user?.role === 'staff') {
        setSupervisors(all.filter(s => s.role === 'hr'));
      } else {
        setSupervisors(all);
      }
    }).catch(() => {});
  }, [user]);

  const isTimeOff = leaveCategory === 'timeoff';
  const isSickLeave = form.reason === 'Sick Leave';

  const canProceed = () => {
    if (step === 0) return !!leaveCategory && !!form.leaveType;
    if (step === 1) return !!form.reason;
    if (!isTimeOff) {
      if (step === 2 && isSickLeave) return true;
      if (step === 2 && !isSickLeave) return !!form.startDate && !!form.endDate;
      if (step === 3) return !!form.startDate && !!form.endDate;
      if (step === 4) return !!form.approvingStaff;
    } else {
      if (step === 2) return !!form.startDate && !!form.startTime && !!form.endTime;
      if (step === 3) return !!form.approvingStaff;
    }
    return true;
  };

  const handleNext = () => {
    // Skip medical step if not sick leave (day category)
    if (!isTimeOff && step === 1 && !isSickLeave) {
      setStep(3); // jump to date
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    // Skip back over medical if not sick
    if (!isTimeOff && step === 3 && !isSickLeave) {
      setStep(1);
      return;
    }
    setStep(step - 1);
  };

  const selectCategory = (cat) => {
    setLeaveCategory(cat);
    setStep(0);
    if (cat === 'timeoff') {
      setForm({ ...form, leaveType: 'Time Off Permission' });
    } else {
      setForm({ ...form, leaveType: 'Full Day Leave' }); // default
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (isTimeOff) {
        payload.startDate = `${form.startDate}T${form.startTime}`;
        payload.endDate = `${form.startDate}T${form.endTime}`;
      }
      await API.post('/leaves', payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  const selectedSupervisor = supervisors.find((s) => s._id === form.approvingStaff);

  // Stepper display
  const stepperSteps = isTimeOff ? STEPS_TOP : (isSickLeave ? STEPS_DAY : [
    'Select Leave Type', 'Select Reason', 'Select Date', 'Select Supervisor', 'Summary & Review'
  ]);

  const getStepperIndex = () => {
    if (!isTimeOff && !isSickLeave) {
      if (step <= 1) return step;
      if (step === 3) return 2;
      if (step === 4) return 3;
      if (step === 5) return 4;
    }
    return step;
  };

  const isLastStep = () => {
    if (isTimeOff) return step === 4;
    if (!isSickLeave) return step === 5;
    return step === 5;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
        </div>

        <div className="modal-body">
          {/* Stepper */}
          {leaveCategory && (
            <div className="stepper">
              {stepperSteps.map((label, i) => (
                <div key={i} className={`step ${i === getStepperIndex() ? 'active' : ''} ${i < getStepperIndex() ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {i < getStepperIndex() ? <CheckIcon /> : i + 1}
                  </div>
                  <div className="step-label">{label}</div>
                </div>
              ))}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {/* STEP 0 — Select category + type */}
          {step === 0 && (
            <div>
              <p style={{ marginBottom: '16px', color: 'var(--gray-500)', fontSize: '14px' }}>
                What kind of leave do you need?
              </p>
              <div className="leave-type-grid">
                <div
                  className={`leave-type-card ${leaveCategory === 'days' ? 'selected' : ''}`}
                  onClick={() => selectCategory('days')}
                >
                  <div className="leave-type-name">Day(s) Leave</div>
                  <div className="leave-type-code">Half day, Full day, Multi-day</div>
                </div>

                <div
                  className={`leave-type-card ${leaveCategory === 'timeoff' ? 'selected' : ''}`}
                  onClick={() => selectCategory('timeoff')}
                >
                  <div className="leave-type-name">Time Off Permission</div>
                  <div className="leave-type-code">TOP — Few hours off</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Reason */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Reason for leave *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Other'].map((r) => (
                    <div
                      key={r}
                      className={`leave-type-card ${form.reason === r ? 'selected' : ''}`}
                      style={{ borderRadius: '10px', textAlign: 'left', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onClick={() => setForm({ ...form, reason: r })}
                    >
                      <span style={{ fontWeight: 500 }}>{r}</span>
                      {r === 'Sick Leave' && (
                        <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px' }}>
                          Medical required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Additional description (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  style={{ resize: 'vertical' }}
                  placeholder="More details…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Medical (only if sick leave + day category) */}
          {step === 2 && !isTimeOff && isSickLeave && (
            <div>
              <label className="form-label">Medical Prescription *</label>
              <div style={{
                border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)',
                padding: '32px', textAlign: 'center', color: 'var(--gray-400)',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏥</div>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Upload your medical prescription</p>
                <p style={{ fontSize: '12px' }}>PNG, JPG, PDF up to 5MB</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} type="button"
                  onClick={() => document.getElementById('med-upload').click()}>
                  Choose file
                </button>
                <input id="med-upload" type="file" style={{ display: 'none' }} accept=".png,.jpg,.jpeg,.pdf" />
              </div>
            </div>
          )}

          {/* STEP 3 — Date (day leave) */}
          {step === 3 && !isTimeOff && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Date & Time (time off only) */}
          {step === 2 && isTimeOff && (
            <div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">From (hour) *</label>
                  <select
                    className="form-select"
                    value={form.startTime || ''}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  >
                    <option value="">Select hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To (hour) *</label>
                  <select
                    className="form-select"
                    value={form.endTime || ''}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  >
                    <option value="">Select hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.startTime && form.endTime && form.startDate && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#eff6ff', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--blue-accent)' }}>
                  ⏱ Permission: {form.startDate} from {form.startTime} to {form.endTime}
                </div>
              )}
            </div>
          )}

          {/* Supervisor step */}
          {((isTimeOff && step === 3) || (!isTimeOff && step === 4)) && (
            <div>
              <label className="form-label">Select Approving Supervisor *</label>
              {supervisors.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>No supervisors found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {supervisors.map((s) => (
                    <div
                      key={s._id}
                      className={`leave-type-card${form.approvingStaff === s._id ? ' selected' : ''}`}
                      style={{ borderRadius: '10px', textAlign: 'left', padding: '14px 18px' }}
                      onClick={() => setForm({ ...form, approvingStaff: s._id })}
                    >
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{s.email} · {s.role?.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary step */}
          {((isTimeOff && step === 4) || (!isTimeOff && step === 5)) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '15px' }}>Review your request</h3>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '20px' }}>
                <table className="review-table">
                  <tbody>
                    <tr><td>Leave Type</td><td>{form.leaveType}</td></tr>
                    <tr><td>Reason</td><td>{form.reason}</td></tr>
                    {form.description && <tr><td>Description</td><td>{form.description}</td></tr>}
                    <tr>
                      <td>Start Date</td>
                      <td>
                        {isTimeOff
                          ? `${form.startDate} at ${form.startTime || '—'}`
                          : form.startDate ? new Date(form.startDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                    <tr>
                      <td>End Date</td>
                      <td>
                        {isTimeOff
                          ? `${form.startDate} at ${form.endTime || '—'}`
                          : form.endDate ? new Date(form.endDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                    <tr><td>Supervisor</td><td>{selectedSupervisor?.name || '—'}</td></tr>
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '12px' }}>
                Your request will be submitted and sent for approval.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="step-actions">
            {step > 0 && (
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
            )}
            {!isLastStep() ? (
              <button className="btn btn-primary" onClick={handleNext} disabled={!canProceed()}>
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}