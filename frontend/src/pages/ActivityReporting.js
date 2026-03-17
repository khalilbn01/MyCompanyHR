import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ActivityReporting() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    API.get('/leaves').then((r) => setLeaves(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build monthly breakdown
  const monthly = MONTHS.map((m, i) => {
    const monthLeaves = leaves.filter((l) => {
      const d = new Date(l.startDate);
      return d.getFullYear() === year && d.getMonth() === i;
    });
    return {
      month: m,
      total: monthLeaves.length,
      approved: monthLeaves.filter((l) => l.status === 'Approved').length,
      pending: monthLeaves.filter((l) => l.status === 'Pending').length,
      rejected: monthLeaves.filter((l) => l.status === 'Rejected').length,
    };
  });

  // Type breakdown
  const byType = {};
  leaves.forEach((l) => { byType[l.leaveType] = (byType[l.leaveType] || 0) + 1; });

  const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Activity Reporting</h1>
        <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Year {year}</span>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /> Loading data…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total Requests', value: leaves.length, cls: 'blue' },
              { label: 'Approved', value: leaves.filter((l) => l.status === 'Approved').length, cls: 'teal' },
              { label: 'Pending', value: leaves.filter((l) => l.status === 'Pending').length, cls: 'amber' },
              { label: 'Rejected', value: leaves.filter((l) => l.status === 'Rejected').length, cls: 'red' },
            ].map((s) => (
              <div className={`stat-card ${s.cls}`} key={s.label}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Monthly bar chart */}
            <div className="table-wrapper" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '20px', fontSize: '15px' }}>Monthly Overview — {year}</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
                {monthly.map((m) => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 500 }}>{m.total || ''}</div>
                    <div
                      style={{
                        width: '100%',
                        background: m.total > 0 ? 'var(--blue-accent)' : 'var(--gray-100)',
                        borderRadius: '4px 4px 0 0',
                        height: `${(m.total / maxMonthly) * 120}px`,
                        minHeight: m.total > 0 ? '8px' : '4px',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By type */}
            <div className="table-wrapper" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '20px', fontSize: '15px' }}>By Leave Type</h3>
              {Object.entries(byType).length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(byType).map(([type, count]) => (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--gray-600)' }}>{type}</span>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--gray-100)', borderRadius: '3px' }}>
                        <div style={{
                          height: '100%',
                          width: `${(count / leaves.length) * 100}%`,
                          background: 'var(--blue-accent)',
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly detail table */}
          <div className="table-wrapper">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Monthly Detail</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 500 }}>{m.month} {year}</td>
                    <td>{m.total || '—'}</td>
                    <td>{m.approved || '—'}</td>
                    <td>{m.pending || '—'}</td>
                    <td>{m.rejected || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
