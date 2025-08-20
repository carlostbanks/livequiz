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
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
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
    }
  };

  const viewDetails = (result) => {
    setSelectedResult(result);
  };

  const closeDetails = () => {
    setSelectedResult(null);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quiz Results - Only animate this since it loads data */}
        {stats.recentResults.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div 
                className="card border-0 shadow-sm"
                style={{animation: `slideInUp 0.3s ease-out 0s both`}}
              >
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
                        {stats.recentResults.map((result, index) => (
                          <tr 
                            key={result.id}
                            style={{
                              animation: `slideInUp 0.3s ease-out ${0.1 + (index * 0.05)}s both`
                            }}
                          >
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
                                onClick={() => viewDetails(result)}
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

      {/* Details Modal - Same as View Results page */}
      {selectedResult && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Quiz Details - {selectedResult.topics?.name || 'Unknown Topic'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDetails}
                ></button>
              </div>
              <div className="modal-body">
                
                {/* Result Summary */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Student Information</h6>
                    <p><strong>Name:</strong> {selectedResult.student_name || 'Anonymous'}</p>
                    <p><strong>Date:</strong> {new Date(selectedResult.created_at).toLocaleString()}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Quiz Performance</h6>
                    <p><strong>Score:</strong> {selectedResult.score}/{selectedResult.total_questions}</p>
                    <p><strong>Percentage:</strong> {Math.round((selectedResult.score / selectedResult.total_questions) * 100)}%</p>
                  </div>
                </div>

                {/* Individual Answers */}
                <h6>Individual Answers</h6>
                {selectedResult.answers_json && selectedResult.answers_json.map((answer, index) => (
                  <div key={index} className={`card mb-2 ${answer.correct ? 'border-success' : 'border-danger'}`}>
                    <div className="card-body py-2">
                      <div className="row align-items-center">
                        <div className="col-md-1">
                          <span className={`badge ${answer.correct ? 'bg-success' : 'bg-danger'}`}>
                            {answer.correct ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="col-md-11">
                          <div className="mb-1">
                            <strong>Q:</strong> {answer.question}
                          </div>
                          <div>
                            <strong>Student said:</strong> "{answer.userAnswer}"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations - Only for data that loads */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;