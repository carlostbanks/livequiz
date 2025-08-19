import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            
            {/* Header */}
            <div className="mb-5">
              <h1 className="display-2 fw-bold text-primary mb-4">
                🌸 BloomQuiz
              </h1>
              <p className="lead text-muted fs-4">
                Voice-based learning platform where students speak their answers
              </p>
              <p className="text-muted">
                No typing, no AI cheating - just pure knowledge verification through speech
              </p>
            </div>

            {/* Action Cards */}
            <div className="row g-4 mb-5">
              {/* Student Card */}
              <div className="col-md-6">
                <div className="card h-100 shadow-lg border-0 hover-card">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="bi bi-person-fill text-primary" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h3 className="card-title text-primary mb-3">I'm a Student</h3>
                    <p className="card-text text-muted mb-4">
                      Take voice-based quizzes on various topics and test your knowledge
                    </p>
                    <button 
                      className="btn btn-primary btn-lg px-4 py-3 w-100"
                      onClick={() => navigate('/student')}
                    >
                      Start Learning 📚
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Card */}
              <div className="col-md-6">
                <div className="card h-100 shadow-lg border-0 hover-card">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="bi bi-gear-fill text-success" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h3 className="card-title text-success mb-3">I'm an Admin</h3>
                    <p className="card-text text-muted mb-4">
                      Create topics, manage questions, and view student results
                    </p>
                    <button 
                      className="btn btn-success btn-lg px-4 py-3 w-100"
                      onClick={() => navigate('/admin')}
                    >
                      Manage Platform ⚙️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="row text-center">
              <div className="col-md-4 mb-4">
                <div className="text-primary mb-3">
                  <i className="bi bi-mic-fill" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold">Voice Recognition</h5>
                <p className="text-muted small">Powered by OpenAI Whisper for accurate speech-to-text</p>
              </div>
              <div className="col-md-4 mb-4">
                <div className="text-success mb-3">
                  <i className="bi bi-shield-check-fill" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold">AI-Proof Testing</h5>
                <p className="text-muted small">Students must speak their answers - no copy/paste or AI assistance</p>
              </div>
              <div className="col-md-4 mb-4">
                <div className="text-info mb-3">
                  <i className="bi bi-graph-up-arrow" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold">Real-time Results</h5>
                <p className="text-muted small">Instant feedback and comprehensive analytics for educators</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .hover-card {
          transition: transform 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}

export default LandingPage;