import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ResultsViewer() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all quiz results
      const { data: resultsData, error: resultsError } = await supabase
        .from('quiz_results')
        .select(`
          *,
          topics:topic_id(name)
        `)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Fetch all topics for filter dropdown
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (topicsError) throw topicsError;

      setResults(resultsData || []);
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Error loading quiz results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getFilteredResults = () => {
    if (selectedTopic === 'all') return results;
    return results.filter(result => result.topic_id === selectedTopic);
  };

  const viewDetails = (result) => {
    setSelectedResult(result);
  };

  const closeDetails = () => {
    setSelectedResult(null);
  };

  const filteredResults = getFilteredResults();

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 fw-bold text-success mb-2">
                  📊 Quiz Results
                </h1>
                <p className="text-muted">View student performance and quiz analytics</p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin')}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Summary */}
        <div className="row mb-4 g-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="card-title mb-0">Filter Results</h6>
                </div>
                <div>
                  <label htmlFor="topicFilter" className="form-label mb-2">Topic:</label>
                  <select 
                    className="form-select"
                    id="topicFilter"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="all">All Topics</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="card-title mb-0">Summary</h6>
                </div>
                <div className="row text-center">
                  <div className="col-4">
                    <div className="text-primary h4 mb-1">{filteredResults.length}</div>
                    <small className="text-muted">Total Attempts</small>
                  </div>
                  <div className="col-4">
                    <div className="text-success h4 mb-1">
                      {filteredResults.length > 0 ? 
                        Math.round((filteredResults.reduce((sum, r) => sum + r.score, 0) / 
                                   filteredResults.reduce((sum, r) => sum + r.total_questions, 0)) * 100) || 0
                        : 0}%
                    </div>
                    <small className="text-muted">Avg Score</small>
                  </div>
                  <div className="col-4">
                    <div className="text-info h4 mb-1">{topics.length}</div>
                    <small className="text-muted">Topics</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="text-muted mb-3">No quiz results found</h3>
            <p className="text-muted">Students haven't taken any quizzes yet, or try changing the filter.</p>
          </div>
        ) : (
          <div 
            className="card border-0 shadow-sm rounded-3"
            style={{animation: `slideInUp 0.3s ease-out 0s both`}}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr 
                        key={result.id}
                        style={{
                          animation: `slideInUp 0.3s ease-out ${0.1 + (index * 0.05)}s both`
                        }}
                      >
                        <td className="py-3 px-4">
                          <small>
                            {new Date(result.created_at).toLocaleDateString()}<br/>
                            <span className="text-muted">
                              {new Date(result.created_at).toLocaleTimeString()}
                            </span>
                          </small>
                        </td>
                        <td className="py-3 px-4">
                          <strong>{result.student_name || 'Anonymous'}</strong>
                        </td>
                        <td className="py-3 px-4">
                          {result.topics?.name || 'Unknown Topic'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge bg-${getScoreColor(result.score, result.total_questions)}`}>
                            {result.score}/{result.total_questions}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong>
                            {Math.round((result.score / result.total_questions) * 100)}%
                          </strong>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewDetails(result)}
                          >
                            <i className="bi bi-info-circle me-1"></i>Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedResult && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  Quiz Details: {selectedResult.topics?.name || 'Unknown Topic'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDetails}
                ></button>
              </div>
              <div className="modal-body p-4">
                
                {/* Result Summary */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm bg-light-subtle">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Student Information</h6>
                        <p className="mb-1"><strong>Name:</strong> {selectedResult.student_name || 'Anonymous'}</p>
                        <p className="mb-0"><strong>Date:</strong> {new Date(selectedResult.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm bg-light-subtle">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Quiz Performance</h6>
                        <p className="mb-1"><strong>Score:</strong> {selectedResult.score}/{selectedResult.total_questions}</p>
                        <p className="mb-0"><strong>Percentage:</strong> {Math.round((selectedResult.score / selectedResult.total_questions) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Answers */}
                <h6 className="fw-bold mb-3">Individual Answers</h6>
                {selectedResult.answers_json && selectedResult.answers_json.map((answer, index) => (
                  <div key={index} className="card mb-3 border-0 shadow-sm rounded-3">
                    <div className="card-body py-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <span className={`badge rounded-pill p-2 fs-6 bg-${answer.correct ? 'success' : 'danger'}`}>
                            {answer.correct ? <i className="bi bi-check-lg"></i> : <i className="bi bi-x-lg"></i>}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 fw-semibold">
                            Q: {answer.question}
                          </p>
                          <p className="mb-0 text-muted">
                            <small>
                              Student's Answer: <span className="text-dark fw-bold">{answer.userAnswer}</span>
                            </small>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations and custom styles */}
      <style>{`
        .bg-light { background-color: #F8F9FA !important; }
        .bg-light-subtle { background-color: #f1f3f5 !important; }
        .text-success { color: #009C6B !important; }
        .text-primary { color: #009C6B !important; }
        .btn-outline-primary { color: #009C6B !important; border-color: #009C6B !important; }
        .btn-outline-primary:hover { background-color: #009C6B !important; color: #fff !important; }

        .form-select {
          border-radius: 0.5rem;
        }

        .card {
          border-radius: 0.75rem;
        }

        .table > :not(caption)>*>* {
          background-color: transparent !important;
        }
        
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

export default ResultsViewer;