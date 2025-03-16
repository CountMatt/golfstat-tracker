// src/components/common/Header.jsx
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">Golf Stats Tracker</Link>
      </div>
    </header>
  );
};

export default Header;