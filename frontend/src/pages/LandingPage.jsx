import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 bg-gradient">
      
      {/* Header */}
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <div className="brand-icon me-2">
              <i className="bi bi-mic-fill text-primary"></i>
            </div>
            <span className="brand-text">BloomQuiz</span>
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link text-muted" href="#features">Features</a>
            <a className="nav-link text-muted" href="#how-it-works">How It Works</a>
            <button 
              className="btn btn-outline-primary btn-sm ms-2"
              onClick={() => navigate('/admin')}
            >
              <i className="bi bi-gear me-1"></i>
              Admin Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">
                  Voice-Powered
                  <span className="text-primary d-block">Quiz Platform</span>
                </h1>
                <p className="hero-subtitle">
                  Transform learning with AI-powered voice quizzes. Students speak their answers, 
                  get instant feedback, and teachers gain valuable insights.
                </p>
                <div className="hero-buttons">
                  <button 
                    className="btn btn-primary btn-lg me-3"
                    onClick={() => navigate('/students')}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Start Taking Quizzes
                  </button>
                  <button 
                    className="btn btn-outline-dark btn-lg"
                    onClick={() => navigate('/admin')}
                  >
                    <i className="bi bi-sliders me-2"></i>
                    Manage Content
                  </button>
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <i className="bi bi-mic text-primary"></i>
                    <span>Voice Recognition</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-robot text-success"></i>
                    <span>AI-Powered</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-graph-up text-info"></i>
                    <span>Real-time Analytics</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-visual">
                <div className="feature-card floating">
                  <div className="card-icon">
                    <i className="bi bi-mic-fill"></i>
                  </div>
                  <h6>Speak Your Answer</h6>
                  <p>Natural voice interaction</p>
                </div>
                <div className="feature-card floating-delayed">
                  <div className="card-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h6>Instant Feedback</h6>
                  <p>AI-powered evaluation</p>
                </div>
                <div className="feature-card floating-slow">
                  <div className="card-icon">
                    <i className="bi bi-bar-chart-fill"></i>
                  </div>
                  <h6>Track Progress</h6>
                  <p>Detailed analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose BloomQuiz?</h2>
            <p className="section-subtitle">
              Modern technology meets educational excellence
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="bi bi-mic"></i>
                </div>
                <h5>Voice Recognition</h5>
                <p>Students answer questions naturally by speaking. No typing required - perfect for all learning styles and accessibility needs.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="bi bi-cpu"></i>
                </div>
                <h5>AI-Powered Grading</h5>
                <p>Advanced AI understands context and meaning, providing accurate assessment of spoken answers in real-time.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h5>Analytics Dashboard</h5>
                <p>Comprehensive insights into student performance, question difficulty, and learning patterns for data-driven decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple, intuitive, and powerful
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">
                  <i className="bi bi-plus-circle"></i>
                </div>
                <h6>Create Topics</h6>
                <p>Add quiz topics and questions through the admin dashboard</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">
                  <i className="bi bi-person"></i>
                </div>
                <h6>Students Join</h6>
                <p>Students access quizzes through the student portal</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">
                  <i className="bi bi-mic"></i>
                </div>
                <h6>Voice Answers</h6>
                <p>Students speak their answers naturally using voice recognition</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-icon">
                  <i className="bi bi-bar-chart"></i>
                </div>
                <h6>View Results</h6>
                <p>Instant feedback and detailed analytics for continuous improvement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="cta-title">Ready to Transform Learning?</h2>
              <p className="cta-subtitle">
                Join thousands of educators using BloomQuiz to create engaging, accessible quizzes.
              </p>
              <div className="cta-buttons">
                <button 
                  className="btn btn-primary btn-lg me-3"
                  onClick={() => navigate('/students')}
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  Get Started Now
                </button>
                <button 
                  className="btn btn-outline-light btn-lg"
                  onClick={() => navigate('/admin')}
                >
                  <i className="bi bi-gear me-2"></i>
                  Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="footer-brand">
                <div className="d-flex align-items-center mb-3">
                  <div className="brand-icon me-2">
                    <i className="bi bi-mic-fill text-primary"></i>
                  </div>
                  <span className="brand-text">BloomQuiz</span>
                </div>
                <p className="footer-desc">
                  Empowering education through voice-powered assessments and AI-driven insights.
                </p>
              </div>
            </div>
            <div className="col-lg-2 col-md-6">
              <h6 className="footer-title">Platform</h6>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/students'); }}>Student Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Admin Dashboard</a></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-6">
              <h6 className="footer-title">Support</h6>
              <ul className="footer-links">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h6 className="footer-title">Get Started Today</h6>
              <p className="footer-desc mb-3">
                Transform your classroom with voice-powered quizzes.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/students')}
              >
                <i className="bi bi-play me-2"></i>
                Start Now
              </button>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="footer-copyright">
                © 2025 BloomQuiz. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="footer-social">
                <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="social-link"><i className="bi bi-github"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        /* Bootstrap Icons CDN */
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        /* Typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Background */
        .bg-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Header */
        .navbar {
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .brand-text {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }

        /* Hero Section */
        .hero-section {
          padding: 80px 0;
          color: white;
        }

        .min-vh-75 {
          min-height: 75vh;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-buttons {
          margin-bottom: 3rem;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .stat-item i {
          font-size: 1.2rem;
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          height: 400px;
        }

        .feature-card {
          position: absolute;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          width: 200px;
          color: #333;
        }

        .feature-card:nth-child(1) {
          top: 20px;
          left: 20px;
        }

        .feature-card:nth-child(2) {
          top: 120px;
          right: 20px;
        }

        .feature-card:nth-child(3) {
          bottom: 20px;
          left: 50px;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .feature-card h6 {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .floating {
          animation: float 3s ease-in-out infinite;
        }

        .floating-delayed {
          animation: float 3s ease-in-out infinite 1s;
        }

        .floating-slow {
          animation: float 4s ease-in-out infinite 2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* Sections */
        .features-section, .how-it-works-section {
          padding: 80px 0;
          background: white;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #666;
          font-weight: 400;
        }

        /* Feature Boxes */
        .feature-box {
          text-align: center;
          padding: 2rem;
          border-radius: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
        }

        .feature-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin: 0 auto 1.5rem;
        }

        .feature-box h5 {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1rem;
        }

        .feature-box p {
          color: #666;
          line-height: 1.6;
        }

        /* Step Cards */
        .step-card {
          text-align: center;
          padding: 2rem 1rem;
          position: relative;
        }

        .step-number {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .step-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          border: 2px solid #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #007bff;
          font-size: 1.3rem;
          margin: 2rem auto 1rem;
        }

        .step-card h6 {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .step-card p {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* CTA Section */
        .cta-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .cta-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* Footer */
        .footer {
          background: #1a1a1a;
          color: white;
          padding: 60px 0 30px;
        }

        .footer-title {
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: white;
        }

        .footer-desc {
          color: #ccc;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .footer-links {
          list-style: none;
          padding: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-links a {
          color: #ccc;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #007bff;
        }

        .footer-divider {
          border-color: #333;
          margin: 2rem 0 1.5rem;
        }

        .footer-copyright {
          color: #999;
          font-size: 0.9rem;
          margin: 0;
        }

        .footer-social {
          display: flex;
          gap: 1rem;
          justify-content: end;
        }

        .social-link {
          width: 36px;
          height: 36px;
          background: #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ccc;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .cta-title {
            font-size: 2rem;
          }
          
          .hero-stats {
            justify-content: center;
          }
          
          .footer-social {
            justify-content: center;
            margin-top: 1rem;
          }
        }

        /* Button Improvements */
        .btn {
          font-weight: 500;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          border: none;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .btn-primary {
          background: linear-gradient(45deg, #007bff, #0056b3);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
          background: linear-gradient(45deg, #0056b3, #004085);
        }

        .btn-outline-primary:hover {
          background: #007bff;
          transform: translateY(-1px);
        }

        .btn-outline-light {
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
        }

        .btn-outline-light:hover {
          background: white;
          color: #1a1a1a;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default LandingPage;