import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';

const AdminDashboardPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="admin-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Kelola platform NovelHub</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'novels' ? 'active' : ''}
            onClick={() => setActiveTab('novels')}
          >
            📚 Novel Management
          </button>
          <button 
            className={activeTab === 'chapters' ? 'active' : ''}
            onClick={() => setActiveTab('chapters')}
          >
            📖 Chapter Approval
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            🚨 Reports
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'novels' && <NovelsTab />}
          {activeTab === 'chapters' && <ChaptersTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

// ============================================
// OVERVIEW TAB
// ============================================
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getOverviewStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat statistik...
      </div>
    );
  }

  if (!stats) {
    return <div className="empty-state">Gagal memuat data</div>;
  }

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers?.toLocaleString() || 0}</h3>
            <p>Total Users</p>
            <span className="stat-change positive">
              +{stats.newUsersToday || 0} hari ini
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalNovels?.toLocaleString() || 0}</h3>
            <p>Total Novel</p>
            <span className="stat-change positive">
              +{stats.newNovelsThisWeek || 0} minggu ini
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{stats.totalChapters?.toLocaleString() || 0}</h3>
            <p>Total Chapter</p>
            <span className="stat-change positive">
              +{stats.newChaptersToday || 0} hari ini
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <h3>{stats.totalViews?.toLocaleString() || 0}</h3>
            <p>Total Views</p>
            <span className="stat-change positive">
              +{stats.viewsToday?.toLocaleString() || 0} hari ini
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingNovels || 0}</h3>
            <p>Novel Pending</p>
            <span className="stat-badge warning">Perlu Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingChapters || 0}</h3>
            <p>Chapter Pending</p>
            <span className="stat-badge warning">Perlu Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <h3>{stats.activeReports || 0}</h3>
            <p>Reports Aktif</p>
            <span className="stat-badge danger">Perlu Tindakan</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-info">
            <h3>{stats.activeAuthors || 0}</h3>
            <p>Author Aktif</p>
            <span className="stat-change positive">
              {stats.authorGrowth || 0}% growth
            </span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn">
            ✅ Approve Pending Content
          </button>
          <button className="action-btn">
            🚨 Review Reports
          </button>
          <button className="action-btn">
            📊 Generate Report
          </button>
          <button className="action-btn">
            📧 Send Announcements
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// NOVELS TAB
// ============================================
const NovelsTab = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNovels();
  }, [filter]);

  const loadNovels = async () => {
    setLoading(true);
    try {
      const data = await adminService.getNovels({ status: filter === 'all' ? undefined : filter });
      setNovels(data.data);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (novelId) => {
    try {
      await adminService.approveNovel(novelId);
      alert('✅ Novel berhasil disetujui!');
      loadNovels();
    } catch (error) {
      alert('❌ Gagal menyetujui novel: ' + error.message);
    }
  };

  const handleReject = async (novelId) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      await adminService.rejectNovel(novelId, reason);
      alert('✅ Novel ditolak');
      loadNovels();
    } catch (error) {
      alert('❌ Gagal menolak novel: ' + error.message);
    }
  };

  const handleDelete = async (novelId) => {
    if (!confirm('⚠️ Yakin ingin menghapus novel ini? Tindakan tidak dapat dibatalkan!')) {
      return;
    }

    try {
      await adminService.deleteNovel(novelId);
      alert('✅ Novel berhasil dihapus');
      loadNovels();
    } catch (error) {
      alert('❌ Gagal menghapus novel: ' + error.message);
    }
  };

  const filteredNovels = novels.filter(novel => 
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat novel...
      </div>
    );
  }

  return (
    <div className="novels-tab">
      <div className="tab-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Cari novel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Semua ({novels.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Judul</th>
              <th>Author</th>
              <th>Status</th>
              <th>Chapters</th>
              <th>Views</th>
              <th>Rating</th>
              <th>Tanggal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNovels.map(novel => (
              <tr key={novel._id}>
                <td>
                  {novel.cover ? (
                    <img src={novel.cover} alt={novel.title} className="table-cover" />
                  ) : (
                    <div className="table-cover-placeholder">{novel.title[0]}</div>
                  )}
                </td>
                <td>
                  <strong>{novel.title}</strong>
                  {novel.mature && <span className="badge-mature">18+</span>}
                </td>
                <td>{novel.author.username}</td>
                <td>
                  <span className={`status-badge ${novel.approvalStatus}`}>
                    {novel.approvalStatus}
                  </span>
                </td>
                <td>{novel.totalChapters}</td>
                <td>{novel.views.toLocaleString()}</td>
                <td>★ {novel.rating.average.toFixed(1)}</td>
                <td>{new Date(novel.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                  <div className="action-buttons-small">
                    {novel.approvalStatus === 'pending' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(novel._id)}
                        >
                          ✅
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(novel._id)}
                        >
                          ❌
                        </button>
                      </>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(novel._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// CHAPTERS TAB
// ============================================
const ChaptersTab = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      const data = await adminService.getPendingChapters();
      setChapters(data.data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (chapterId) => {
    try {
      await adminService.approveChapter(chapterId);
      alert('✅ Chapter berhasil disetujui!');
      loadChapters();
    } catch (error) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleReject = async (chapterId) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      await adminService.rejectChapter(chapterId, reason);
      alert('✅ Chapter ditolak');
      loadChapters();
    } catch (error) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat chapters...
      </div>
    );
  }

  return (
    <div className="chapters-tab">
      <h2>⏳ Pending Chapters ({chapters.length})</h2>

      {chapters.length === 0 ? (
        <div className="empty-state">
          <p>✅ Tidak ada chapter yang perlu direview</p>
        </div>
      ) : (
        <div className="chapter-list">
          {chapters.map(chapter => (
            <div key={chapter._id} className="chapter-review-card">
              <div className="chapter-review-header">
                <div>
                  <h3>{chapter.novel.title}</h3>
                  <p>Bab {chapter.number}: {chapter.title}</p>
                  <span className="author-info">
                    oleh {chapter.novel.author.username}
                  </span>
                </div>
                <div className="chapter-meta">
                  <span>{chapter.wordCount} kata</span>
                  <span>{new Date(chapter.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <div className="chapter-content-preview">
                {chapter.content.substring(0, 300)}...
              </div>

              <div className="chapter-review-actions">
                <button 
                  className="btn-approve"
                  onClick={() => handleApprove(chapter._id)}
                >
                  ✅ Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleReject(chapter._id)}
                >
                  ❌ Reject
                </button>
                <button className="btn-secondary">
                  👁️ View Full
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// USERS TAB
// ============================================
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers({ role: filter === 'all' ? undefined : filter });
      setUsers(data.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm('⚠️ Yakin ingin ban user ini?')) return;

    const reason = prompt('Alasan ban:');
    if (!reason) return;

    try {
      await adminService.banUser(userId, reason);
      alert('✅ User berhasil dibanned');
      loadUsers();
    } catch (error) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      alert('✅ User berhasil di-unban');
      loadUsers();
    } catch (error) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat users...
      </div>
    );
  }

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>👥 User Management ({users.length})</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Semua
          </button>
          <button 
            className={filter === 'reader' ? 'active' : ''}
            onClick={() => setFilter('reader')}
          >
            Readers
          </button>
          <button 
            className={filter === 'author' ? 'active' : ''}
            onClick={() => setFilter('author')}
          >
            Authors
          </button>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <strong>{user.username}</strong>
                  {user.badges?.map(badge => (
                    <span key={badge} className="user-badge">{badge}</span>
                  ))}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.isBanned ? (
                    <span className="status-badge banned">Banned</span>
                  ) : (
                    <span className="status-badge active">Active</span>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                  {user.isBanned ? (
                    <button 
                      className="btn-approve"
                      onClick={() => handleUnbanUser(user._id)}
                    >
                      ✅ Unban
                    </button>
                  ) : (
                    <button 
                      className="btn-delete"
                      onClick={() => handleBanUser(user._id)}
                    >
                      🚫 Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// REPORTS TAB
// ============================================
const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await adminService.getReports();
      setReports(data.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId) => {
    const action = prompt('Tindakan yang diambil:');
    if (!action) return;

    try {
      await adminService.resolveReport(reportId, action);
      alert('✅ Report berhasil diresolve');
      loadReports();
    } catch (error) {
      alert('❌ Gagal: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat reports...
      </div>
    );
  }

  return (
    <div className="reports-tab">
      <h2>🚨 Active Reports ({reports.length})</h2>

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>✅ Tidak ada report aktif</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <span className={`report-type ${report.type}`}>
                  {report.type}
                </span>
                <span className="report-date">
                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>

              <div className="report-content">
                <p><strong>Reporter:</strong> {report.reporter.username}</p>
                <p><strong>Target:</strong> {report.targetType} - {report.targetId}</p>
                <p><strong>Alasan:</strong> {report.reason}</p>
              </div>

              <button 
                className="btn-primary"
                onClick={() => handleResolve(report._id)}
              >
                ✅ Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ANALYTICS TAB
// ============================================
const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat analytics...
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      <h2>📈 Platform Analytics</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📊 Traffic Growth</h3>
          <div className="analytics-chart">
            <p>Daily Active Users: {analytics?.dailyActiveUsers || 0}</p>
            <p>Monthly Active Users: {analytics?.monthlyActiveUsers || 0}</p>
            <p>Growth Rate: +{analytics?.growthRate || 0}%</p>
          </div>
        </div>

        <div className="analytics-card">
          <h3>📚 Top Novels</h3>
          <ul className="top-list">
            {analytics?.topNovels?.map((novel, idx) => (
              <li key={novel._id}>
                {idx + 1}. {novel.title} ({novel.views.toLocaleString()} views)
              </li>
            ))}
          </ul>
        </div>

        <div className="analytics-card">
          <h3>✍️ Top Authors</h3>
          <ul className="top-list">
            {analytics?.topAuthors?.map((author, idx) => (
              <li key={author._id}>
                {idx + 1}. {author.username} ({author.totalNovels} novels)
              </li>
            ))}
          </ul>
        </div>

        <div className="analytics-card">
          <h3>🏷️ Popular Genres</h3>
          <ul className="top-list">
            {analytics?.popularGenres?.map((genre, idx) => (
              <li key={idx}>
                {genre.name}: {genre.count} novels
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;