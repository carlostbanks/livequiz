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

  useEffect(() => {
    filterResults();
  }, [selectedTopic]);

  const fetchData = async () => {
    try {
      setLoading(true);

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

  const filterResults = () => {
    // This will be handled by the display logic
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

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  const filteredResults = getFilteredResults();

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
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">Filter Results</h6>
                <div className="mb-3">
                  <label htmlFor="topicFilter" className="form-label">Topic:</label>
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
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">Summary</h6>
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
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Topic</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result.id}>
                        <td>
                          <small>
                            {new Date(result.created_at).toLocaleDateString()}<br/>
                            <span className="text-muted">
                              {new Date(result.created_at).toLocaleTimeString()}
                            </span>
                          </small>
                        </td>
                        <td>
                          <strong>{result.student_name || 'Anonymous'}</strong>
                        </td>
                        <td>
                          {result.topics?.name || 'Unknown Topic'}
                        </td>
                        <td>
                          <span className={`badge bg-${getScoreColor(result.score, result.total_questions)}`}>
                            {result.score}/{result.total_questions}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {Math.round((result.score / result.total_questions) * 100)}%
                          </strong>
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
        )}

      </div>

      {/* Details Modal */}
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
    </div>
  );
}

export default ResultsViewer;