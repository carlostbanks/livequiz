// File: frontend/src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ variant = 'landing', showAuth = true }) {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleNavLinkClick = () => {
    setIsNavOpen(false);
  };

  const handleTogglerClick = () => {
    setIsNavOpen(!isNavOpen);
  };

  const getNavbarClass = () => {
    switch (variant) {
      case 'transparent':
        return 'navbar-transparent';
      case 'dashboard':
        return 'navbar-dashboard';
      default:
        return 'navbar-landing';
    }
  };

  return (
    <header className={`navbar navbar-expand-lg ${getNavbarClass()}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="brand-icon me-2">
            <i className="bi bi-mic-fill"></i>
          </div>
          <span className="brand-text">BloomQuiz</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
          onClick={handleTogglerClick}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
          <div className="navbar-nav ms-auto align-items-center">
            
            {/* Landing page navigation */}
            {variant === 'landing' && (
              <>
                <a className="nav-link" href="#features" onClick={handleNavLinkClick}>
                  Features
                </a>
                <a className="nav-link" href="#how-it-works" onClick={handleNavLinkClick}>
                  How It Works
                </a>
              </>
            )}

            {/* Authentication section */}
            {showAuth && (
              <>
                {user ? (
                  <div className="navbar-user">
                    <span className="user-email">{user.email}</span>
                    <button 
                      className="btn btn-outline-secondary btn-sm ms-2"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-primary btn-sm ms-2 mt-2 mt-lg-0"
                    onClick={() => { navigate('/login'); handleNavLinkClick(); }}
                  >
                    <i className="bi bi-person me-1"></i>
                    Professional Login
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;