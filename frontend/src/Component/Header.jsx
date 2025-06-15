import React from 'react';
import './Header.css';
import { CloudSun } from 'lucide-react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-section">
        <CloudSun className="logo-icon" />
        <h1 className="app-title"> Air Quality Prediction System 🌍</h1>
      </div>
      <p className="app-subtitle">Track. Predict. Breathe Easy.</p>
    </header>
  );
};

export default Header;
