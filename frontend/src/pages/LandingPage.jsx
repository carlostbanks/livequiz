import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamically add Bootstrap CSS and JS to the document head and body.
    // This is the correct way to load external scripts and stylesheets in a React component
    // to ensure they work as intended.
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
      // Clean up the added elements when the component unmounts
      document.head.removeChild(bootstrapCss);
      document.head.removeChild(bootstrapIcons);
      document.body.removeChild(bootstrapJs);
    };
  }, []); // The empty dependency array ensures this runs only once

  return (
    <>
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #009C6B 0%, #007A54 100%)' }}>

        {/* Header */}
        <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
          <div className="container">
            <a className="navbar-brand d-flex align-items-center" href="#">
              <div className="brand-icon me-2">
                <i className="bi bi-mic-fill"></i>
              </div>
              <span className="brand-text">BloomQuiz</span>
            </a>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ms-auto align-items-center">
                <a className="nav-link text-muted" href="#features">Features</a>
                <a className="nav-link text-muted" href="#how-it-works">How It Works</a>
                <button
                  className="btn btn-outline-primary btn-sm ms-2 mt-2 mt-lg-0"
                  onClick={() => navigate('/admin')}
                >
                  <i className="bi bi-gear me-1"></i>
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="row align-items-center min-vh-75">
              <div className="col-lg-6 text-center text-lg-start">
                <div className="hero-content text-white">
                  <h1 className="hero-title">
                    Voice-Powered
                    <span className="quiz-platform-text d-block">Quiz Platform</span>
                  </h1>
                  <p className="hero-subtitle mx-auto mx-lg-0">
                    Transform learning with AI-powered voice quizzes. Students speak their answers,
                    get instant feedback, and teachers gain valuable insights.
                  </p>
                  <div className="hero-buttons">
                    <button
                      className="btn btn-primary btn-lg me-3 mb-3 mb-sm-0"
                      onClick={() => navigate('/students')}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Taking Quizzes
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => navigate('/admin')}
                    >
                      <i className="bi bi-sliders me-2"></i>
                      Manage Content
                    </button>
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
              <h2 className="section-title">Why Choose BloomQuiz?</h2>
              <p className="section-subtitle">
                Modern technology meets educational excellence
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="feature-box text-center">
                  <div className="feature-icon">
                    <i className="bi bi-mic"></i>
                  </div>
                  <h5>Voice Recognition</h5>
                  <p>Students answer questions naturally by speaking. No typing required - perfect for all learning styles and accessibility needs.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-box text-center">
                  <div className="feature-icon">
                    <i className="bi bi-cpu"></i>
                  </div>
                  <h5>AI-Powered Grading</h5>
                  <p>Advanced AI understands context and meaning, providing accurate assessment of spoken answers in real-time.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-box text-center">
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
            <div className="row g-4 position-relative">
              <div className="col-lg-3 col-md-6">
                <div className="step-card text-center">
                  <div className="step-wrapper">
                    <div className="step-icon">
                      <i className="bi bi-plus-circle"></i>
                    </div>
                    <div className="step-pulse"></div>
                  </div>
                  <h6>Create Topics</h6>
                  <p>Add quiz topics and questions through the admin dashboard</p>
                </div>
              </div>

              <div className="step-arrow-1 d-none d-lg-block">
                <i className="bi bi-arrow-right"></i>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="step-card text-center">
                  <div className="step-wrapper">
                    <div className="step-icon">
                      <i className="bi bi-person"></i>
                    </div>
                    <div className="step-pulse"></div>
                  </div>
                  <h6>Students Join</h6>
                  <p>Students access quizzes through the student portal</p>
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
                  <p>Students speak their answers naturally using voice recognition</p>
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
                    className="btn btn-primary btn-lg me-3 mb-3 mb-sm-0"
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
            <div className="row text-center text-lg-start">
              <div className="col-lg-4">
                <div className="d-flex flex-column align-items-center align-items-lg-start">
                  <div className="d-flex align-items-center mb-3">
                    <div className="brand-icon me-2">
                      <i className="bi bi-mic-fill"></i>
                    </div>
                    <span className="brand-text">BloomQuiz</span>
                  </div>
                  <p className="footer-desc mx-auto mx-lg-0" style={{ maxWidth: '280px' }}>
                    Empowering education through voice-powered assessments
                  </p>
                </div>
              </div>
              <div className="col-lg-2 col-md-6 mt-4 mt-lg-0">
                <h6 className="footer-title">Platform</h6>
                <ul className="footer-links">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/students'); }}>Student Portal</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Admin Dashboard</a></li>
                  <li><a href="#features">Features</a></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-6 mt-4 mt-lg-0">
                <h6 className="footer-title">Support</h6>
                <ul className="footer-links">
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">Help Center</a></li>
                </ul>
              </div>
              <div className="col-lg-4 mt-4 mt-lg-0">
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
              <div className="col-md-6 text-center text-md-start">
                <p className="footer-copyright">
                  © 2025 BloomQuiz. All rights reserved.
                </p>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-social d-inline-flex">
                  <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                  <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
                  <a href="#" className="social-link"><i className="bi bi-github"></i></a>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        .bg-gradient {
          background: linear-gradient(135deg, #009C6B 0%, #007A54 100%);
        }

        .quiz-platform-text {
          color: #000 !important;
        }

        /* Header */
        .navbar {
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          background: #009C6B;
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
          padding: 120px 0;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="20" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .min-vh-75 {
          min-height: 60vh;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 2rem;
          letter-spacing: -1.5px;
          text-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.95;
          margin-bottom: 3rem;
          line-height: 1.7;
          font-weight: 400;
          max-width: 500px;
        }

        .hero-buttons {
          margin-bottom: 3rem;
        }

        .hero-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          z-index: 3;
        }

        .hero-icon-circle {
          width: 200px;
          height: 200px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 5rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(20px);
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          position: relative;
        }

        .hero-icon-circle::before {
          content: '';
          position: absolute;
          top: -50px;
          left: -50px;
          right: -50px;
          bottom: -50px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: pulse-ring 3s infinite;
        }

        .hero-tagline {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        /* Features Section */
        .features-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-top: 3px solid #009C6B;
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

        .feature-box {
          text-align: center;
          padding: 2rem;
          border-radius: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .feature-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(45deg, #009C6B, #007A54);
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

        /* How It Works Section */
        .how-it-works-section {
          padding: 80px 0;
          background: white;
          border-top: 3px solid #009C6B;
        }

        .step-card {
          text-align: center;
          padding: 2rem 1rem;
          position: relative;
        }

        .step-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .step-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #009C6B, #007A54);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.8rem;
          position: relative;
          z-index: 2;
          box-shadow: 0 10px 30px rgba(0, 156, 107, 0.3);
          transition: all 0.3s ease;
        }

        .step-card:hover .step-icon {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 156, 107, 0.4);
        }

        .step-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(0, 156, 107, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .step-arrow-1, .step-arrow-2, .step-arrow-3 {
          position: absolute;
          top: 40%;
          color: #009C6B;
          font-size: 2rem;
          z-index: 10;
        }

        .step-arrow-1 {
          left: 23%;
        }

        .step-arrow-2 {
          left: 48%;
        }

        .step-arrow-3 {
          left: 73%;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
        }

        .step-card h6 {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .step-card p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
          border-top: 3px solid #009C6B;
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
          color: #009C6B;
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
          background: #009C6B;
          color: white;
          transform: translateY(-2px);
        }

        /* Buttons - ALL GREEN */
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
          background: #009C6B !important;
          box-shadow: 0 4px 12px rgba(0, 156, 107, 0.3);
          color: white !important;
          border: 2px solid #009C6B !important;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 156, 107, 0.4);
          background: #007A54 !important;
          color: white !important;
          border-color: #007A54 !important;
        }

        .btn-outline-primary {
          border: 2px solid #009C6B !important;
          color: #009C6B !important;
          background: transparent !important;
        }

        .btn-outline-primary:hover {
          background: #009C6B !important;
          border-color: #009C6B !important;
          color: white !important;
          transform: translateY(-1px);
        }

        .btn-outline-light {
          border: 2px solid #009C6B !important;
          color: #009C6B !important;
          background: white !important;
        }

        /* Hero Section Button Overrides - Same hover behavior for both */
        .hero-section .btn-primary {
          background: white !important;
          color: #1a1a1a !important;
          border: 2px solid white !important;
        }

        .hero-section .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
          background: white !important;
          color: #1a1a1a !important;
          border-color: white !important;
        }

        .hero-section .btn-outline-light {
          background: transparent !important;
          color: white !important;
          border: 2px solid white !important;
        }

        /* CTA Section Button Overrides - Same hover behavior for both */
        .cta-section .btn-primary {
          background: #009C6B !important;
          box-shadow: 0 4px 12px rgba(0, 156, 107, 0.3);
          color: white !important;
          border: 2px solid #009C6B !important;
        }

        .cta-section .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(0, 156, 107, 0.6) !important;
          background: #009C6B !important;
          color: white !important;
          border-color: #009C6B !important;
        }

        .cta-section .btn-outline-light {
          border: 2px solid white !important;
          color: white !important;
          background: transparent !important;
        }

        .cta-section .btn-outline-light:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.6) !important;
          background: transparent !important;
          color: white !important;
          border-color: white !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-section {
            padding: 80px 0;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .cta-title {
            font-size: 2rem;
          }

          .footer-social {
            justify-content: center;
            margin-top: 1rem;
          }

          .footer-brand .d-flex {
            justify-content: center;
          }

          .footer .brand-text {
            color: white !important;
          }
        }
      `}</style>
    </>
  );
}

export default LandingPage;