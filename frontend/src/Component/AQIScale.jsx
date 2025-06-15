import React from 'react';
import './AQIScale.css';

const AQIScale = ({ aqi, label = "AQI" }) => {
  const getPosition = () => {
    const ranges = [
      { max: 50, pos: 5 },
      { max: 100, pos: 20 },
      { max: 150, pos: 40 },
      { max: 200, pos: 60 },
      { max: 300, pos: 80 },
      { max: Infinity, pos: 95 }
    ];
    for (let i = 0; i < ranges.length; i++) {
      if (aqi <= ranges[i].max) return `${ranges[i].pos}%`;
    }
    return '0%';
  };

  const getCategory = () => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Poor';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Hazardous';
  };

  const category = getCategory();

  return (
    <div className="aqi-container">
      <h2 className="aqi-heading">
        {label}: <span className={`aqi-text ${category.toLowerCase()}`}>
          {aqi.toFixed(2)} – {category}
        </span>
      </h2>

      <div className="scale-wrapper">
        <div className="scale-gradient" />
        <div className="scale-indicator" style={{ left: getPosition() }}>
          <div className="bubble" />
          <div className="bubble-value">{aqi.toFixed(2)}</div>
        </div>
      </div>

      <div className="scale-labels">
        <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span><span>301+</span>
      </div>

      <div className="scale-categories">
        {['Good', 'Moderate', 'Poor', 'Unhealthy', 'Severe', 'Hazardous'].map((cat) => (
          <span key={cat} className={`cat-label ${category === cat ? 'active' : ''}`}>
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AQIScale;
