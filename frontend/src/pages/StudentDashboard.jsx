import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Icon mapping - much cleaner than storing in database!
const TOPIC_ICONS = {
  'basic math': '🔢',
  'javascript basics': '💻', 
  'react fundamentals': '⚛️',
  'html & css': '🌐'
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch topics from database
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      
      // Get topics with question count
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          *,
          questions:questions(count)
        `)
        .order('created_at');

      if (topicsError) throw topicsError;

      // Transform data to include question count
      const topicsWithCounts = topicsData.map(topic => ({
        ...topic,
        questionCount: topic.questions[0]?.count || 0,
        icon: TOPIC_ICONS[topic.name.toLowerCase()] || '📚'
      }));

      setTopics(topicsWithCounts);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Oops! Something went wrong</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchTopics}>
              Try Again
            </button>
          </div>
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
                <h1 className="display-5 fw-bold text-primary mb-2">
                  🌸 Choose Your Topic
                </h1>
                <p className="lead text-muted">
                  Select a topic below to start your voice-based quiz
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

        {/* Topics Grid */}
        {topics.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="text-muted mb-3">No topics available yet</h3>
            <p className="text-muted">Check back soon or contact an administrator!</p>
          </div>
        ) : (
          <div className="row g-4">
            {topics.map((topic) => (
              <div key={topic.id} className="col-lg-6 col-xl-4">
                <div className="card h-100 shadow-sm border-0 hover-card">
                  <div className="card-body p-4">
                    
                    {/* Topic Icon & Title */}
                    <div className="text-center mb-3">
                      <div className="mb-3" style={{fontSize: '3rem'}}>
                        {topic.icon}
                      </div>
                      <h5 className="card-title fw-bold text-dark mb-2">
                        {topic.name}
                      </h5>
                      <p className="card-text text-muted small">
                        {topic.description}
                      </p>
                    </div>

                    {/* Topic Info */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Difficulty:</span>
                        <span className={`badge bg-${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Questions:</span>
                        <span className="fw-semibold">{topic.questionCount}</span>
                      </div>
                    </div>

                    {/* Start Button */}
                    <button 
                      className="btn btn-primary w-100 py-2"
                      onClick={() => navigate(`/quiz/${topic.id}`)}
                      disabled={topic.questionCount === 0}
                    >
                      {topic.questionCount === 0 ? 'No Questions Yet' : 'Start Quiz 🎯'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body text-center p-5">
                <h4 className="text-muted mb-3">🚀 More Topics Coming Soon!</h4>
                <p className="text-muted">
                  Admins can add new topics anytime. Have a suggestion? Let us know!
                </p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Custom styles */}
      <style>{`
        .hover-card {
          transition: all 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;