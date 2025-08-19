import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalQuestions: 0,
    totalQuizResults: 0,
    recentResults: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get topics count
      const { count: topicsCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true });

      // Get questions count
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Get quiz results count
      const { count: resultsCount } = await supabase
        .from('quiz_results')
        .select('*', { count: 'exact', head: true });

      // Get recent quiz results
      const { data: recentResults } = await supabase
        .from('quiz_results')
        .select(`
          *,
          topics:topic_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalTopics: topicsCount || 0,
        totalQuestions: questionsCount || 0,
        totalQuizResults: resultsCount || 0,
        recentResults: recentResults || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold text-success mb-2">
                  ⚙️ Admin Dashboard
                </h1>
                <p className="lead text-muted">
                  Manage topics, questions, and view student results
                </p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="text-primary mb-3">
                  <i className="bi bi-collection" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h3 className="fw-bold text-primary mb-1">{stats.totalTopics}</h3>
                <p className="text-muted mb-0">Total Topics</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="text-info mb-3">
                  <i className="bi bi-question-circle" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h3 className="fw-bold text-info mb-1">{stats.totalQuestions}</h3>
                <p className="text-muted mb-0">Total Questions</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="text-success mb-3">
                  <i className="bi bi-clipboard-check" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h3 className="fw-bold text-success mb-1">{stats.totalQuizResults}</h3>
                <p className="text-muted mb-0">Quiz Results</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="text-warning mb-3">
                  <i className="bi bi-graph-up" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h3 className="fw-bold text-warning mb-1">
                  {stats.totalQuizResults > 0 ? 
                    Math.round((stats.recentResults.reduce((sum, result) => sum + result.score, 0) / 
                               stats.recentResults.reduce((sum, result) => sum + result.total_questions, 0)) * 100) || 0
                    : 0}%
                </h3>
                <p className="text-muted mb-0">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title text-primary mb-3">📚 Manage Content</h5>
                <p className="card-text text-muted mb-4">
                  Create and edit topics and questions for student quizzes
                </p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/topics')}
                  >
                    Manage Topics & Questions
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/admin/topics?create=true')}
                  >
                    + Create New Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title text-success mb-3">📊 View Results</h5>
                <p className="card-text text-muted mb-4">
                  Monitor student performance and quiz analytics
                </p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={() => navigate('/admin/results')}
                  >
                    View All Results
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => navigate('/admin/analytics')}
                  >
                    Analytics Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quiz Results */}
        {stats.recentResults.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="card-title mb-0">🕒 Recent Quiz Results</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Topic</th>
                          <th>Score</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResults.map((result) => (
                          <tr key={result.id}>
                            <td>
                              <strong>{result.student_name || 'Anonymous'}</strong>
                            </td>
                            <td>
                              {result.topics?.name || 'Unknown Topic'}
                            </td>
                            <td>
                              <span className={`badge ${
                                result.score / result.total_questions >= 0.7 
                                  ? 'bg-success' 
                                  : result.score / result.total_questions >= 0.5 
                                  ? 'bg-warning' 
                                  : 'bg-danger'
                              }`}>
                                {result.score}/{result.total_questions}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(result.created_at).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/results/${result.id}`)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;