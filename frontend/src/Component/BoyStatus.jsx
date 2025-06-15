import React from 'react';
import './BoyStatus.css';
import happy from '../images/happy.png';
import neutral from '../images/sad.jpg';
import sad from '../images/sad2.png';

const BoyStatus = ({ aqi }) => {
  const getBoyImage = () => {
    if (aqi <= 50) return happy;
    if (aqi <= 150) return neutral;
    return sad;
  };

  const getMessage = () => {
    if (aqi <= 50) return "Tommorow air will be clean! 😊";
    if (aqi <= 150) return "Tommorow air will be moderate. 😐";
    return "Tommorow air will be unhealthy! 😢";
  };

  return (
    <div className="boy-container">
      <img src={getBoyImage()} alt="Boy reacting to AQI" className="boy-image" />
      <p className="boy-message">{getMessage()}</p>
    </div>
  );
};

export default BoyStatus;
