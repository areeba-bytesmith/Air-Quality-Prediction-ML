import React, { useState } from "react";
import "./PredictionForm.css";
import AQIScale from './AQIScale.jsx';
import BoyStatus from "./BoyStatus.jsx";
import Header from "./Header.jsx";
import NavBar from "./NavBar.jsx";

function PredictionForm() {
  const [formData, setFormData] = useState({
    pm25: "",
    pm10: "",
    no2: "",
    nh3: "",
    so2: "",
    co: "",
    ozone: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [predictionDay1, setPredictionDay1] = useState(null);
  const [predictionDay2, setPredictionDay2] = useState(null);

  const pollutantLimits = {
    pm25: { min: 0, max: 200 },
    pm10: { min: 0, max: 200 },
    no2: { min: 0, max: 80 },
    nh3: { min: 0, max: 70 },
    so2: { min: 0, max: 70 },
    co: { min: 0, max: 30 },
    ozone: { min: 0, max: 70 },
  };

  const isValidNumber = (value) => /^-?\d*\.?\d*$/.test(value);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!isValidNumber(value)) {
      setFormErrors(prev => ({
        ...prev,
        [name]: "❌ Only numeric values are allowed",
      }));
    } else {
      const numValue = parseFloat(value);
      const { min, max } = pollutantLimits[name];
      if (value === "" || isNaN(numValue) || numValue < min || numValue > max) {
        setFormErrors(prev => ({
          ...prev,
          [name]: `❌ Value must be between ${min} and ${max}`,
        }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    for (const [key, { min, max }] of Object.entries(pollutantLimits)) {
      const value = formData[key];
      const numValue = parseFloat(value);

      if (
        value === "" ||
        isNaN(numValue) ||
        !isValidNumber(value) ||
        numValue < min ||
        numValue > max
      ) {
        errors[key] = `❌ Value must be between ${min} and ${max}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setPredictionDay1(data.prediction_day1);
      setPredictionDay2(data.prediction_day2);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <h1 className="main-title">🌿 Enter pollutant levels to predict AQI of Today and Tomorrow</h1>

        <form onSubmit={handleSubmit} className="form-card">
          {Object.entries(pollutantLimits).map(([name, { min, max }]) => {
            const labelMap = {
              pm25: "PM2.5",
              pm10: "PM10",
              no2: "NO2",
              nh3: "NH3",
              so2: "SO2",
              co: "CO",
              ozone: "Ozone",
            };
            const unitMap = {
              co: "mg/m³",
            };
            const label = labelMap[name];
            const unit = unitMap[name] || "µg/m³";

            return (
              <div className="input-group" key={name}>
                <label className="input-label">{label} ({unit})</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={`Enter ${label} value`}
                  required
                />
                <small className="hint">Allowed range: {min} - {max}</small>
                {formErrors[name] && <div className="error-text">{formErrors[name]}</div>}
              </div>
            );
          })}

          <button type="submit" className="submit-btn">🔍 Predict</button>
        </form>

        <div className="prediction-card">
          <h2 className="prediction-heading">Prediction Results</h2>
          {predictionDay1 !== null && predictionDay2 !== null ? (
            <>
              <p className="prediction-text">
                <strong>🌤️ AQI of Today:</strong>{" "}
                <span className="prediction-badge">{predictionDay1}</span>
              </p>
              <p className="prediction-text">
                <strong>🌥️ AQI of Tomorrow:</strong>{" "}
                <span className="prediction-badge">{predictionDay2}</span>
              </p>
            </>
          ) : (
            <p className="prediction-text">
              <span className="prediction-badge">No prediction yet</span>
            </p>
          )}
        </div>

        {predictionDay1 !== null && (
          <AQIScale aqi={predictionDay1} label="Today's AQI Scale" />
        )}
        {predictionDay2 !== null && (
          <AQIScale aqi={predictionDay2} label="Tomorrow's AQI Scale" />
        )}

        <BoyStatus aqi={predictionDay1} />
        <NavBar />
      </div>
    </>
  );
}

export default PredictionForm;
