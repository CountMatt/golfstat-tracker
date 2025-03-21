// src/components/round/FairwaySelector.jsx
import React from 'react';

const FairwaySelector = ({ selected, onChange, teeClub, onClubChange }) => {
  const clubs = [
    "Driver", "7W", "4", "5", "6", "7", "8", "9", "PW", "50", "54", "58"
  ];

  return (
    <div className="fairway-selector-container">
      <div className="fairway-row">
        <button 
          className={`fairway-btn ${selected === 'left' ? 'selected' : ''}`}
          onClick={() => onChange('left')}
        >
          Miss Left
        </button>
        <button 
          className={`fairway-btn hit ${selected === 'hit' ? 'selected' : ''}`}
          onClick={() => onChange('hit')}
        >
          Hit
        </button>
        <button 
          className={`fairway-btn ${selected === 'right' ? 'selected' : ''}`}
          onClick={() => onChange('right')}
        >
          Miss Right
        </button>
      </div>
      <div className="tee-club-row">
        <select
          className="tee-club-select"
          value={teeClub || ''}
          onChange={(e) => onClubChange(e.target.value)}
        >
          <option value="">Tee Club</option>
          {clubs.map(club => (
            <option key={club} value={club}>{club}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(FairwaySelector);