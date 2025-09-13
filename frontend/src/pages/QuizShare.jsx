// File: frontend/src/pages/QuizShare.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './QuizShare.css';

function QuizShare() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizData();
    // Poll for new results every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [shareId]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/quizzes/share/${shareId}`);
      if (!response.ok) {
        throw new Error('Quiz not found');
      }
      const data = await response.json();
      setQuiz(data);
      fetchResults();
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Quiz not found or has been deleted');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`http://localhost:3001/quiz-attempts/quiz/${shareId}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.attempts || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const copyToClipboard = async (text) => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      setTimeout(() => setCopying(false), 1000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopying(false);
    }
  };

  const shareUrl = quiz ? `${window.location.origin}/quiz/take/${shareId}` : '';

  const calculateStats = () => {
    if (results.length === 0) return { totalAttempts: 0, avgScore: 0, completionRate: 0 };
    
    const completed = results.filter(r => r.status === 'completed');
    const totalScore = completed.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    const completionRate = Math.round((completed.length / results.length) * 100);

    return {
      totalAttempts: results.length,
      avgScore,
      completionRate
    };
  };

  if (loading) {
    return (
      <div className="quiz-share-page">
        <Navbar variant="landing" />
        <div className="share-container">
          <div className="container py-5">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3"></div>
              <h4>Loading quiz...</h4>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-share-page">
        <Navbar variant="landing" />
        <div className="share-container">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="error-card">
                  <div className="error-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <h3>Quiz Not Found</h3>
                  <p className="text-muted">
                    This quiz may have been deleted or the link is incorrect.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    Create New Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="quiz-share-page">
      <Navbar variant="landing" />
      
      <div className="share-container">
        <div className="container py-5">
          
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <div className="success-badge">
                <i className="bi bi-check-circle"></i>
                Quiz Created Successfully!
              </div>
              <h1 className="quiz-title">{quiz.title}</h1>
              <p className="quiz-description">{quiz.description}</p>
            </div>
          </div>

          {/* Share Section */}
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto">
              <div className="share-card">
                <div className="share-header">
                  <h3>Share Your Quiz</h3>
                  <p>Send this link to participants to take your voice quiz</p>
                </div>
                
                <div className="share-link-section">
                  <div className="link-display">
                    <input 
                      type="text" 
                      className="form-control share-input" 
                      value={shareUrl}
                      readOnly
                    />
                    <button 
                      className="btn btn-primary copy-btn"
                      onClick={() => copyToClipboard(shareUrl)}
                      disabled={copying}
                    >
                      {copying ? (
                        <>
                          <i className="bi bi-check"></i>
                          Copied!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clipboard"></i>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="share-buttons">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Take my voice quiz: ${encodeURIComponent(shareUrl)}`)}
                  >
                    <i className="bi bi-twitter"></i>
                    Share on Twitter
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
                  >
                    <i className="bi bi-facebook"></i>
                    Share on Facebook
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(quiz.title)}&body=Take my voice quiz: ${encodeURIComponent(shareUrl)}`)}
                  >
                    <i className="bi bi-envelope"></i>
                    Share via Email
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Results */}
          <div className="row">
            
            {/* Stats Cards */}
            <div className="col-lg-4 mb-4">
              <div className="stats-section">
                <h4 className="section-title">Quiz Statistics</h4>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalAttempts}</div>
                    <div className="stat-label">Total Attempts</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="bi bi-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.avgScore}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.completionRate}%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                </div>

                <div className="quiz-info">
                  <h5>Quiz Details</h5>
                  <div className="info-item">
                    <span className="info-label">Questions:</span>
                    <span className="info-value">{quiz.question_count}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">Voice Quiz</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Created:</span>
                    <span className="info-value">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="btn btn-outline-primary btn-block"
                    onClick={() => window.open(`/quiz/take/${shareId}`, '_blank')}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Preview Quiz
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-block"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-plus me-2"></i>
                    Create Another Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="col-lg-8">
              <div className="results-section">
                <div className="results-header">
                  <h4 className="section-title">Recent Results</h4>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchResults}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="empty-results">
                    <div className="empty-icon">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <h5>No results yet</h5>
                    <p className="text-muted">
                      Results will appear here as people take your quiz.
                      Share the link above to get started!
                    </p>
                  </div>
                ) : (
                  <div className="results-list">
                    {results.slice(0, 10).map((result, index) => (
                      <div key={result.id} className="result-item">
                        <div className="result-avatar">
                          <div className="avatar-circle">
                            {index + 1}
                          </div>
                        </div>
                        <div className="result-content">
                          <div className="result-header">
                            <span className="participant-name">
                              Participant #{result.id}
                            </span>
                            <span className="result-time">
                              {new Date(result.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="result-details">
                            <div className="score-badge">
                              {result.score || 0}% Score
                            </div>
                            <div className="status-badge status-completed">
                              <i className="bi bi-check-circle me-1"></i>
                              {result.status || 'Completed'}
                            </div>
                          </div>
                        </div>
                        <div className="result-actions">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate(`/quiz/results/${result.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {results.length > 10 && (
                      <div className="text-center mt-3">
                        <button className="btn btn-outline-secondary">
                          View All Results ({results.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer variant="minimal" />
    </div>
  );
}

export default QuizShare;