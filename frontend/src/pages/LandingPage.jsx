// File: frontend/src/pages/LandingPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Bootstrap CSS and JS
    const bootstrapCss = document.createElement('link');
    bootstrapCss.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    bootstrapCss.rel = "stylesheet";
    document.head.appendChild(bootstrapCss);

    const bootstrapIcons = document.createElement('link');
    bootstrapIcons.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css";
    bootstrapIcons.rel = "stylesheet";
    document.head.appendChild(bootstrapIcons);

    const bootstrapJs = document.createElement('script');
    bootstrapJs.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js";
    bootstrapJs.async = true;
    document.body.appendChild(bootstrapJs);

    return () => {
      // Cleanup
      if (document.head.contains(bootstrapCss)) document.head.removeChild(bootstrapCss);
      if (document.head.contains(bootstrapIcons)) document.head.removeChild(bootstrapIcons);
      if (document.body.contains(bootstrapJs)) document.body.removeChild(bootstrapJs);
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar variant="landing" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6 text-center text-lg-start">
              <div className="hero-content">
                <h1 className="hero-title">
                  Voice-Powered
                  <span className="quiz-platform-text d-block">Quiz Platform</span>
                </h1>
                <p className="hero-subtitle">
                  Create and share voice quizzes in minutes. Perfect for educators, 
                  trainers, and anyone who wants to make learning interactive.
                </p>
                <div className="hero-buttons">
                  <button
                    className="btn btn-primary btn-lg me-3 mb-3 mb-sm-0"
                    onClick={() => navigate('/create-quiz')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Your Quiz
                  </button>
                  <button
                    className="btn btn-outline-white btn-lg"
                    onClick={() => navigate('/login')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Professional Login
                  </button>
                </div>
                <div className="hero-pricing">
                  <span className="pricing-tag">
                    <i className="bi bi-lightning me-1"></i>
                    Only $1 per quiz • No monthly fees
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="hero-visual">
                <div className="hero-icon-circle">
                  <i className="bi bi-mic-fill"></i>
                </div>
                <h3 className="hero-tagline">Speak. Learn. Excel.</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Two Ways to Use BloomQuiz</h2>
            <p className="section-subtitle">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="plan-card casual-plan">
                <div className="plan-header">
                  <h3>Casual Quizzes</h3>
                  <div className="plan-price">$1 per quiz</div>
                </div>
                <div className="plan-features">
                  <ul>
                    <li>Create unlimited questions</li>
                    <li>Share with friends & family</li>
                    <li>Voice-powered answers</li>
                    <li>Instant results</li>
                    <li>Download certificates</li>
                  </ul>
                </div>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => navigate('/create-quiz')}
                >
                  Start Creating
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="plan-card professional-plan">
                <div className="plan-header">
                  <h3>Professional</h3>
                  <div className="plan-price">$30/month</div>
                </div>
                <div className="plan-features">
                  <ul>
                    <li>Unlimited quiz creation</li>
                    <li>Unique student links</li>
                    <li>Advanced analytics</li>
                    <li>Student progress tracking</li>
                    <li>Gradebook integration</li>
                  </ul>
                </div>
                <button 
                  className="btn btn-outline-primary btn-block"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                </button>
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
          <div className="row g-4 position-relative">
            <div className="col-lg-3 col-md-6">
              <div className="step-card text-center">
                <div className="step-wrapper">
                  <div className="step-icon">
                    <i className="bi bi-plus-circle"></i>
                  </div>
                  <div className="step-pulse"></div>
                </div>
                <h6>Create Quiz</h6>
                <p>Add questions and answers in minutes</p>
              </div>
            </div>

            <div className="step-arrow-1 d-none d-lg-block">
              <i className="bi bi-arrow-right"></i>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="step-card text-center">
                <div className="step-wrapper">
                  <div className="step-icon">
                    <i className="bi bi-share"></i>
                  </div>
                  <div className="step-pulse"></div>
                </div>
                <h6>Share Link</h6>
                <p>Send your quiz link to participants</p>
              </div>
            </div>

            <div className="step-arrow-2 d-none d-lg-block">
              <i className="bi bi-arrow-right"></i>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="step-card text-center">
                <div className="step-wrapper">
                  <div className="step-icon">
                    <i className="bi bi-mic"></i>
                  </div>
                  <div className="step-pulse"></div>
                </div>
                <h6>Voice Answers</h6>
                <p>Participants speak their answers naturally</p>
              </div>
            </div>

            <div className="step-arrow-3 d-none d-lg-block">
              <i className="bi bi-arrow-right"></i>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="step-card text-center">
                <div className="step-wrapper">
                  <div className="step-icon">
                    <i className="bi bi-bar-chart"></i>
                  </div>
                  <div className="step-pulse"></div>
                </div>
                <h6>View Results</h6>
                <p>See scores and detailed analytics</p>
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
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-subtitle">
                Create your first voice quiz in under 5 minutes.
              </p>
              <div className="cta-buttons">
                <button
                  className="btn btn-primary btn-lg me-3 mb-3 mb-sm-0"
                  onClick={() => navigate('/create-quiz')}
                >
                  <i className="bi bi-plus me-2"></i>
                  Create Quiz ($1)
                </button>
                <button
                  className="btn btn-outline-white btn-lg"
                  onClick={() => navigate('/register')}
                >
                  <i className="bi bi-building me-2"></i>
                  Professional Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;