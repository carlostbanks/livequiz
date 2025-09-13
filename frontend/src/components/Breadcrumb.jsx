// File: frontend/src/components/Breadcrumb.jsx
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <div className="container">
        <ol className="breadcrumb">
          {items.map((item, index) => (
            <li 
              key={index} 
              className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            >
              {index === items.length - 1 ? (
                <span>{item.label}</span>
              ) : (
                <Link to={item.href} className="breadcrumb-link">
                  {item.icon && <i className={item.icon}></i>}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export default Breadcrumb;