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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch topics from database
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          *,
          questions:questions(count)
        `)
        .order('created_at');

      if (topicsError) throw topicsError;

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
      <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-stripe py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Loading topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-stripe py-5">
        <div className="text-center">
          <div className="alert alert-danger shadow-sm">
            <h4 className="alert-heading">Oops! Something went wrong</h4>
            <p className="mb-0">{error}</p>
            <button className="btn btn-primary mt-3" onClick={fetchTopics}>
              Try Again
            </button>
          </div>
          <button 
            className="btn btn-outline-secondary mt-4"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 py-5 bg-stripe">
      <div className="container">
        
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold text-dark mb-2 page-title">
                  Choose Your Topic
                </h1>
                <p className="lead text-secondary">
                  Select a topic below to start your voice-based quiz.
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
            <h3 className="text-secondary mb-3">No topics available yet</h3>
            <p className="text-secondary">Check back soon or contact an administrator!</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {topics.map((topic, index) => (
              <div key={topic.id} className="col-lg-6 col-xl-4">
                <div 
                  className="card h-100 border-0 shadow-sm hover-card"
                  style={{
                    animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    
                    {/* Topic Icon & Title */}
                    <div className="text-center mb-3">
                      <div className="mb-3" style={{fontSize: '3rem'}}>
                        {topic.icon}
                      </div>
                      <h5 className="card-title fw-bold text-dark mb-2">
                        {topic.name}
                      </h5>
                      <p className="card-text text-secondary small flex-grow-1">
                        {topic.description}
                      </p>
                    </div>

                    {/* Topic Info */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary small">Difficulty:</span>
                        <span className={`badge rounded-pill text-dark border border-secondary fw-normal`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-secondary small">Questions:</span>
                        <span className="fw-semibold text-dark">{topic.questionCount}</span>
                      </div>
                    </div>

                    {/* Start Button */}
                    <button 
                      className={`btn w-100 py-2 ${topic.questionCount === 0 ? 'btn-secondary disabled' : 'btn-primary'}`}
                      onClick={() => navigate(`/quiz/${topic.id}`)}
                      disabled={topic.questionCount === 0}
                    >
                      {topic.questionCount === 0 ? 'No Questions Yet' : (
                        <>
                          Start Quiz <i className="bi bi-arrow-right-short"></i>
                        </>
                      )}
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
            <div className="card border-0 shadow-sm cta-card">
              <div className="card-body text-center p-5">
                <h4 className="text-secondary mb-3">🚀 More Topics Coming Soon!</h4>
                <p className="text-secondary">
                  Admins can add new topics anytime. Have a suggestion? Let us know!
                </p>
                <button 
                  className="btn btn-outline-primary mt-3"
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        .bg-stripe {
          background-color: #F9F9FB !important;
        }

        .text-primary {
          color: #009C6B !important;
        }

        .text-secondary {
          color: #6C757D !important;
        }
        
        .text-dark {
          color: #212529 !important;
        }

        .page-title {
            color: #212529 !important;
        }

        .btn {
            border-radius: 8px;
            font-weight: 500;
        }

        .btn-primary {
          background-color: #009C6B !important;
          color: white !important;
          border-color: #009C6B !important;
          transition: all 0.2s ease-in-out;
        }

        .btn-primary:hover {
          background-color: #007A54 !important;
          border-color: #007A54 !important;
          transform: translateY(-1px);
        }

        .btn-outline-primary {
          color: #009C6B !important;
          border-color: #009C6B !important;
          font-weight: 500;
        }

        .btn-outline-primary:hover {
          background-color: #009C6B !important;
          color: white !important;
        }

        .btn-outline-secondary {
          color: #6C757D !important;
          border-color: #E0E0E0 !important;
          font-weight: 500;
        }

        .btn-outline-secondary:hover {
          background-color: #E0E0E0 !important;
        }

        .btn-secondary.disabled, .btn-secondary:disabled {
          background-color: #E0E0E0 !important;
          border-color: #E0E0E0 !important;
          color: #6C757D !important;
          opacity: 0.8;
          cursor: not-allowed;
          font-weight: 500;
        }
        
        .hover-card {
          border: 1px solid #E0E0E0;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border-radius: 12px;
        }
        
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important;
          border-color: #009C6B;
        }
        
        .card {
          background-color: white !important;
          border-radius: 12px;
        }
        
        .cta-card {
          background: #F0F2F5 !important;
          border-radius: 12px;
        }
        
        .badge {
            font-size: 0.75em;
            padding: 0.5em 0.75em;
            font-weight: 500;
        }
        
        .badge.bg-success { background-color: #D4EDDA !important; color: #155724 !important; border: 1px solid #C3E6CB; }
        .badge.bg-warning { background-color: #FFF3CD !important; color: #856404 !important; border: 1px solid #FFEBA6; }
        .badge.bg-danger { background-color: #F8D7DA !important; color: #721C24 !important; border: 1px solid #F5C6CB; }
        .badge.bg-secondary { background-color: #E9ECEF !important; color: #6C757D !important; border: 1px solid #D6D8DB; }


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

export default StudentDashboard;