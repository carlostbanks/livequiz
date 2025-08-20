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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    <div className="container-fluid min-vh-100 py-5 bg-stripe">
      <div className="container">
        
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold text-dark mb-2">
                  <i className="bi bi-gear-fill me-2 text-primary"></i>Admin Dashboard
                </h1>
                <p className="lead text-secondary">
                  Manage content and monitor student performance
                </p>
              </div>
              <button 
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/')}
              >
                <i className="bi bi-box-arrow-left me-2"></i>Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          {/* Card 1: Total Topics */}
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-primary mb-3">
                <i className="bi bi-collection-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold mb-0 display-4 text-dark">{stats.totalTopics}</h3>
              <p className="text-secondary mb-0 fw-semibold">Topics</p>
            </div>
          </div>
          
          {/* Card 2: Total Questions */}
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-success mb-3">
                <i className="bi bi-question-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold mb-0 display-4 text-dark">{stats.totalQuestions}</h3>
              <p className="text-secondary mb-0 fw-semibold">Questions</p>
            </div>
          </div>
          
          {/* Card 3: Total Quiz Results */}
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-info mb-3">
                <i className="bi bi-clipboard-check-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold mb-0 display-4 text-dark">{stats.totalQuizResults}</h3>
              <p className="text-secondary mb-0 fw-semibold">Results</p>
            </div>
          </div>
          
          {/* Card 4: Avg Score */}
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-warning mb-3">
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold mb-0 display-4 text-dark">
                {stats.totalQuizResults > 0 
                  ? `${Math.round((stats.recentResults.reduce((sum, result) => sum + result.score, 0) / 
                                  stats.recentResults.reduce((sum, result) => sum + result.total_questions, 0)) * 100) || 0}%`
                  : 'N/A'}
              </h3>
              <p className="text-secondary mb-0 fw-semibold">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-primary mb-3">
                <i className="bi bi-journal-text" style={{fontSize: '3rem'}}></i>
              </div>
              <h5 className="fw-bold text-dark mb-3">Manage Content</h5>
              <p className="text-secondary mb-4">
                Create and edit topics and questions for student quizzes.
              </p>
              <button 
                className="btn btn-primary btn-lg w-100"
                onClick={() => navigate('/admin/topics')}
              >
                Go to Topics
              </button>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="dashboard-card border-0 shadow-sm p-4 text-center">
              <div className="text-success mb-3">
                <i className="bi bi-bar-chart-line-fill" style={{fontSize: '3rem'}}></i>
              </div>
              <h5 className="fw-bold text-dark mb-3">View Results</h5>
              <p className="text-secondary mb-4">
                Monitor student performance and quiz analytics.
              </p>
              <button 
                className="btn btn-success btn-lg w-100"
                onClick={() => navigate('/admin/results')}
              >
                Go to Results
              </button>
            </div>
          </div>
        </div>

        {/* Recent Quiz Results Table */}
        <div className="row">
          <div className="col-12">
            <h4 className="fw-bold text-dark mb-4">Recent Quiz Results</h4>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading recent results...</p>
              </div>
            ) : stats.recentResults.length > 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="py-3">Student</th>
                          <th className="py-3">Topic</th>
                          <th className="py-3">Score</th>
                          <th className="py-3">Date</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResults.map((result, index) => (
                          <tr key={result.id}>
                            <td className="py-3 fw-semibold text-dark">
                              {result.student_name || 'Anonymous'}
                            </td>
                            <td className="py-3 text-secondary">
                              {result.topics?.name || 'Unknown Topic'}
                            </td>
                            <td className="py-3">
                              <span className={`badge rounded-pill fs-6 p-2 bg-${getScoreColor(result.score, result.total_questions)}`}>
                                {result.score}/{result.total_questions}
                              </span>
                            </td>
                            <td className="py-3 text-secondary">
                              {new Date(result.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3">
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
            ) : (
              <div className="text-center py-5">
                <p className="text-secondary">No recent quiz results found.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Details Modal */}
      {selectedResult && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  Quiz Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDetails}
                ></button>
              </div>
              <div className="modal-body p-4">
                
                {/* Result Summary */}
                <div className="row g-2 mb-4">
                  <div className="col-12">
                    <h4 className="fw-bold text-primary mb-1">{selectedResult.topics?.name || 'Unknown Topic'}</h4>
                    <p className="text-secondary mb-3">
                      <span className="fw-semibold text-dark">Student:</span> {selectedResult.student_name || 'Anonymous'}
                      <br/>
                      <span className="fw-semibold text-dark">Date:</span> {new Date(selectedResult.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="card text-center bg-light border-0 shadow-sm h-100">
                      <div className="card-body">
                        <p className="text-muted mb-1">Final Score</p>
                        <h4 className="fw-bold mb-0 text-dark">
                          {selectedResult.score}/{selectedResult.total_questions}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card text-center bg-light border-0 shadow-sm h-100">
                      <div className="card-body">
                        <p className="text-muted mb-1">Percentage</p>
                        <h4 className="fw-bold mb-0 text-dark">
                          {Math.round((selectedResult.score / selectedResult.total_questions) * 100)}%
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Answers */}
                <h6 className="fw-bold text-primary mb-3 mt-4">Individual Answers</h6>
                {selectedResult.answers_json && selectedResult.answers_json.map((answer, index) => (
                  <div 
                    key={index} 
                    className={`quiz-answer-card d-flex align-items-center p-3 mb-2 rounded-3 shadow-sm border border-${answer.correct ? 'success' : 'danger'}`}
                  >
                    <div className="flex-grow-1 me-3">
                      <p className="fw-semibold mb-1 text-dark">
                        <span className="text-muted me-2">{index + 1}.</span>{answer.question}
                      </p>
                      <hr className="text-muted my-2" style={{ width: '75%', marginLeft: '0' }} />
                      <p className="mb-1">
                        <span className="text-dark">Student's Answer:</span> 
                        <span className="text-secondary"> "{answer.userAnswer}"</span>
                      </p>
                      {!answer.correct && (
                        <p className="mb-0">
                          <span className="text-dark">Correct Answer:</span> 
                          <span className="text-secondary"> "{answer.correctAnswer}"</span>
                        </p>
                      )}
                    </div>
                    {/* The grade box with the icon */}
                    <div className={`grade-box p-3 rounded-2 text-center bg-${answer.correct ? 'success' : 'danger'}`}>
                      <i className={`bi bi-${answer.correct ? 'check-lg' : 'x-lg'} text-white`} style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary w-100" 
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .bg-stripe { background-color: #F9F9FB !important; }
        .text-primary { color: #009C6B !important; }
        .text-secondary { color: #6C757D !important; }
        .text-dark { color: #212529 !important; }
        .text-info { color: #17a2b8 !important; }
        .text-success { color: #28a745 !important; }
        .text-warning { color: #ffc107 !important; }
        .text-danger { color: #dc3545 !important; }

        .btn-primary { background-color: #009C6B !important; border-color: #009C6B !important; }
        .btn-success { background-color: #28a745 !important; border-color: #28a745 !important; }
        .btn-outline-secondary { color: #6C757D !important; border-color: #E0E0E0 !important; }
        .btn-outline-secondary:hover { background-color: #E0E0E0 !important; }

        .dashboard-card {
          background-color: white;
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
        
        .modal-content {
          border-radius: 16px;
        }

        .quiz-answer-card {
          transition: transform 0.2s, box-shadow 0.2s;
          background-color: white;
        }
        
        .quiz-answer-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        
        .table-borderless > tbody > tr > td,
        .table-borderless > tbody > tr > th,
        .table-borderless > tfoot > tr > td,
        .table-borderless > tfoot > tr > th,
        .table-borderless > thead > tr > td,
        .table-borderless > thead > tr > th {
            border: none;
        }

        .grade-box {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;