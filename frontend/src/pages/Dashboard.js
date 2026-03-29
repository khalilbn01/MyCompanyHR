import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ Total: 0, Pending: 0, Approved: 0, Rejected: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, leavesRes] = await Promise.all([
          API.get('/leaves/stats'),
          API.get('/leaves?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setRecentLeaves(leavesRes.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Requests', value: stats.Total, cls: 'blue' },
    { label: 'Approved', value: stats.Approved, cls: 'teal' },
    { label: 'Pending', value: stats.Pending, cls: 'amber' },
    { label: 'Rejected', value: stats.Rejected, cls: 'red' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            Welcome back, <strong>{user?.name}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/leave-requests')}>
          + Request a Leave
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s) => (
          <div className={`stat-card ${s.cls}`} key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{loading ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Recent Leave Requests</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/leave-requests')}>View all</button>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" />Loading…</div>
        ) : recentLeaves.length === 0 ? (
          <div className="empty-state">
            <h3>No leave requests yet</h3>
            <p>Submit your first request to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Requesting Staff</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="staff-name">{leave.requestingStaff?.name}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.duration}</td>
                  <td>{leave.reason}</td>
                  <td><span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
