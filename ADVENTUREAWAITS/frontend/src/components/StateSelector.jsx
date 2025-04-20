import React from 'react';
import { useNavigate } from 'react-router-dom';
import { states } from '../data';
import '../styles/StateSelector.css';

const StateSelector = ({ selectedState, onStateChange }) => {
  const navigate = useNavigate();
  
  const handleStateClick = (stateId) => {
    // Update the selected state in the parent component
    onStateChange(stateId);
    
    // Navigate to the state details page
    navigate(`/state/${stateId}`);
  };
  
  return (
    <div className="state-selector-container">
      <h3 className="state-title">Explore Indian States</h3>
      
      <div className="states-grid">
        {states.map((state) => (
          <div 
            key={state.id}
            className={`state-card ${selectedState === state.id ? 'selected' : ''}`}
            onClick={() => handleStateClick(state.id)}
          >
            <h4>{state.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateSelector;
