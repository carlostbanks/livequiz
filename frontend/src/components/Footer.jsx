// File: frontend/src/components/Footer.jsx
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer({ variant = 'default' }) {
  const navigate = useNavigate();

  const getFooterClass = () => {
    switch (variant) {
      case 'minimal':
        return 'footer-minimal';
      case 'dark':
        return 'footer-dark';
      default:
        return 'footer-default';
    }
  };

  if (variant === 'minimal') {
    return (
      <footer className="footer footer-minimal">
        <div className="container">
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
    );
  }

  return (
    <footer className={`footer ${getFooterClass()}`}>
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
              <p className="footer-desc mx-auto mx-lg-0">
                Empowering education through voice-powered assessments
              </p>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mt-4 mt-lg-0">
            <h6 className="footer-title">Platform</h6>
            <ul className="footer-links">
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/create-quiz'); }}>
                  Create Quiz
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                  Professional Login
                </a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
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
              onClick={() => navigate('/create-quiz')}
            >
              <i className="bi bi-plus me-2"></i>
              Create Your First Quiz
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
  );
}

export default Footer;