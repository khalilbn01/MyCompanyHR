import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import LeaveRequestModal from '../components/LeaveRequestModal';

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
);

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function LeaveRequests() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin';


  const [activeTab, setActiveTab] = useState('mine');
  const [leaves, setLeaves] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  // For HR approval panel
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [hrComment, setHrComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const [myRes] = await Promise.all([API.get(`/leaves?${params}`)]);
      setLeaves(myRes.data.data);

      if (isHR) {
        const pendingRes = await API.get('/leaves/pending');
        setPending(pendingRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, isHR]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApprove = async (id, status) => {
    setActionLoading(true);
    setActionMsg('');
    try {
      await API.put(`/leaves/${id}/status`, { status, hrComment });
      setActionMsg(`Request ${status.toLowerCase()} successfully.`);
      setSelectedLeave(null);
      setHrComment('');
      fetchLeaves();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await API.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  const displayLeaves = activeTab === 'mine' ? leaves : pending;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leave Requests</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Request a Leave
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
          My Leave Requests
        </button>
        {isHR && (
          <button className={`tab ${activeTab === 'approve' ? 'active' : ''}`} onClick={() => setActiveTab('approve')}>
            Requests to Approve
            {pending.length > 0 && (
              <span style={{ marginLeft: '8px', background: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                {pending.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="filter-input"
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          className="filter-input"
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <button className="btn btn-primary btn-sm" onClick={() => setFilters({ startDate: '', endDate: '' })}>
          Clear Filter
        </button>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className={`alert ${actionMsg.includes('failed') || actionMsg.includes('error') ? 'alert-error' : 'alert-success'}`}>
          {actionMsg}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /> Loading requests…</div>
        ) : displayLeaves.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <h3>{activeTab === 'mine' ? 'No leave requests yet' : 'No pending requests'}</h3>
            <p>{activeTab === 'mine' ? 'Click "+ Request a Leave" to get started.' : 'All caught up!'}</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requesting Staff</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Approving Staff</th>
                  <th>Med. Prescription</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayLeaves.map((leave) => (
                  <React.Fragment key={leave._id}>
                    <tr>
                      <td className="staff-name">{leave.requestingStaff?.name}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.leaveType}</td>
                      <td>{leave.duration}</td>
                      <td>{leave.reason}</td>
                      <td className="supervisor-name">{leave.approvingStaff?.name || '—'}</td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>{leave.medicalPrescription ? 'Attached' : '—'}</td>
                      <td><StatusBadge status={leave.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {isHR && leave.status === 'Pending' && (
                            <button
                              className="action-btn"
                              title="Review"
                              onClick={() => {
                                setSelectedLeave(selectedLeave?._id === leave._id ? null : leave);
                                setHrComment('');
                                setActionMsg('');
                              }}
                            >
                              ⚙️
                            </button>
                          )}
                          {leave.status === 'Pending' && leave.requestingStaff?._id === user?.id && (
                            <button className="action-btn" title="Delete" onClick={() => handleDelete(leave._id)}>
                              🗑️
                            </button>
                          )}
                          <button className="action-btn" title="Details" onClick={() => {}}>
                            ☰
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* HR Approval inline panel */}
                    {selectedLeave?._id === leave._id && (
                      <tr>
                        <td colSpan={10} style={{ padding: 0 }}>
                          <div className="approval-panel">
                            <h4>Review Request — {leave.requestingStaff?.name}</h4>
                            <div className="form-group">
                              <label className="form-label">HR Comment (optional)</label>
                              <textarea
                                className="form-input"
                                rows={2}
                                placeholder="Add a comment…"
                                value={hrComment}
                                onChange={(e) => setHrComment(e.target.value)}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                disabled={actionLoading}
                                onClick={() => handleApprove(leave._id, 'Approved')}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading}
                                onClick={() => handleApprove(leave._id, 'Rejected')}
                              >
                                ✕ Reject
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setSelectedLeave(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Rows per page: <select defaultValue={50}><option value={10}>10</option><option value={50}>50</option></select></span>
              <span>1–{displayLeaves.length} of {displayLeaves.length}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>‹</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>›</button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <LeaveRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchLeaves();
          }}
        />
      )}
    </div>
  );
}
