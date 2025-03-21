// src/pages/TrackRound.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRound, updateHoleData } from '../utils/localStorage';
import GreenGrid from '../components/round/GreenGrid';
import FairwaySelector from '../components/round/FairwaySelector';

const TrackRound = () => {
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const currentHole = parseInt(holeNumber || '1');
  
  const [round, setRound] = useState(null);
  const [holeData, setHoleData] = useState({
    number: currentHole,
    par: 4,
    score: 4,
    fairwayHit: null,
    teeClub: '',
    girHit: false,
    greenPosition: null,
    approachDistance: 0,
    approachClub: '',
    firstPuttDistance: 0,
    putts: 2,
    upAndDownAttempt: false,
    upAndDownSuccess: false,
    fromSand: false
  });

  // Load round data when component mounts or params change
  useEffect(() => {
    const roundData = getRound(roundId);
    if (!roundData) {
      navigate('/');
      return;
    }
    
    setRound(roundData);
    
    // Check if current hole data exists
    const existingHoleData = roundData.holes.find(h => h.number === currentHole);
    if (existingHoleData) {
      setHoleData(existingHoleData);
    } else {
      // Reset for new hole with sensible defaults
      setHoleData({
        number: currentHole,
        par: 4,
        score: 4,
        fairwayHit: null,
        teeClub: '',
        girHit: false,
        greenPosition: null,
        approachDistance: 0,
        approachClub: '',
        firstPuttDistance: 0,
        putts: 2,
        upAndDownAttempt: false,
        upAndDownSuccess: false,
        fromSand: false
      });
    }
  }, [roundId, currentHole, navigate]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setHoleData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Auto update GIR when greenPosition changes
      if (field === 'greenPosition') {
        newData.girHit = value === 'center';
      }
      
      // Auto update score when par changes
      if (field === 'par') {
        newData.score = value;
      }
      
      return newData;
    });
  }, []);

  // Save hole data and navigate
  const handleSaveHole = useCallback(() => {
    // Save current hole data
    const updatedRound = updateHoleData(roundId, currentHole, holeData);
    setRound(updatedRound);
    
    // Navigate to next hole or summary if finished
    if (currentHole < (round?.holeCount || 18)) {
      navigate(`/track/${roundId}/${currentHole + 1}`);
    } else {
      navigate(`/round/${roundId}`);
    }
  }, [roundId, currentHole, holeData, round, navigate]);

  // Navigation between holes
  const handlePrevHole = useCallback(() => {
    if (currentHole > 1) {
      navigate(`/track/${roundId}/${currentHole - 1}`);
    }
  }, [currentHole, roundId, navigate]);
  
  const handleNextHole = useCallback(() => {
    if (currentHole < (round?.holeCount || 18)) {
      navigate(`/track/${roundId}/${currentHole + 1}`);
    }
  }, [currentHole, round, roundId, navigate]);

  // Generate score options based on par
  const generateScoreOptions = useCallback(() => {
    const par = holeData.par || 4;
    return [
      par - 1, // Birdie
      par,     // Par
      par + 1, // Bogey
      par + 2, // Double bogey
      par + 3  // Triple bogey
    ];
  }, [holeData.par]);

  if (!round) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="track-round-container">
      <div className="track-header">
        <h2>Hole {currentHole} • Par {holeData.par}</h2>
        <div className="hole-nav">
          <span className="nav-arrow" onClick={handlePrevHole}>◀️</span>
          <span className="nav-arrow" onClick={handleNextHole}>▶️</span>
        </div>
      </div>
      
      <div className="option-group">
        <div className="option-title">PAR</div>
        <div className="button-row">
          <button 
            className={`option-btn ${holeData.par === 3 ? 'selected' : ''}`}
            onClick={() => handleInputChange('par', 3)}
          >3</button>
          <button 
            className={`option-btn ${holeData.par === 4 ? 'selected' : ''}`}
            onClick={() => handleInputChange('par', 4)}
          >4</button>
          <button 
            className={`option-btn ${holeData.par === 5 ? 'selected' : ''}`}
            onClick={() => handleInputChange('par', 5)}
          >5</button>
        </div>
      </div>
      
      {/* Only show fairway for Par 4 and 5 */}
      {holeData.par > 3 && (
        <div className="option-group">
          <div className="option-title">FAIRWAY & TEE CLUB</div>
          <FairwaySelector
            selected={holeData.fairwayHit}
            onChange={(value) => handleInputChange('fairwayHit', value)}
            teeClub={holeData.teeClub}
            onClubChange={(value) => handleInputChange('teeClub', value)}
          />
        </div>
      )}
      
      
<div className="option-group">
  <div className="option-title">GREEN & PUTTING</div>
  <div className="gir-putting-container">
    {/* Left side: Approach inputs */}
    <div className="approach-inputs">
      <div className="input-row">
        <label>Approach (m):</label>
        <input
          type="number"
          value={holeData.approachDistance || ''}
          onChange={(e) => handleInputChange('approachDistance', Number(e.target.value))}
          min="0"
          inputMode="numeric"
          className="compact-input"
        />
      </div>
      <div className="input-row">
        <label>Club:</label>
        <select
          value={holeData.approachClub || ''}
          onChange={(e) => handleInputChange('approachClub', e.target.value)}
          className="compact-input"
        >
          <option value="">Club</option>
          <option value="7Wood">7W</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="PW">PW</option>
          <option value="50">50</option>
          <option value="54">54</option>
          <option value="58">58</option>
        </select>
      </div>
      
      {/* Putting inputs */}
      <div className="input-row">
        <label>First putt (m):</label>
        <input
          type="number"
          value={holeData.firstPuttDistance || ''}
          onChange={(e) => handleInputChange('firstPuttDistance', Number(e.target.value))}
          min="0"
          step="0.1"
          inputMode="numeric"
          className="compact-input"
        />
      </div>
      <div className="input-row">
        <label>Total putts:</label>
        <div className="compact-button-row">
          <button 
            className={`option-btn ${holeData.putts === 1 ? 'selected' : ''}`}
            onClick={() => handleInputChange('putts', 1)}
          >1</button>
          <button 
            className={`option-btn ${holeData.putts === 2 ? 'selected' : ''}`}
            onClick={() => handleInputChange('putts', 2)}
          >2</button>
          <button 
            className={`option-btn ${holeData.putts === 3 ? 'selected' : ''}`}
            onClick={() => handleInputChange('putts', 3)}
          >3</button>
          <button 
            className={`option-btn ${holeData.putts === 4 ? 'selected' : ''}`}
            onClick={() => handleInputChange('putts', 4)}
          >4+</button>
        </div>
      </div>
    </div>
    
    {/* Right side: Green grid */}
    <div className="green-grid-container">
      <GreenGrid
        selected={holeData.greenPosition}
        onChange={(value) => handleInputChange('greenPosition', value)}
      />
    </div>
  </div>
</div>
      
      <div className="option-group">
        <div className="option-title">SCORE</div>
        <div className="button-row">
          {generateScoreOptions().map(score => (
            <button 
              key={score}
              className={`option-btn ${holeData.score === score ? 'selected' : ''}`}
              onClick={() => handleInputChange('score', score)}
            >
              {score}
            </button>
          ))}
          <button 
            className="option-btn"
            onClick={() => {
              const customScore = prompt("Enter score:");
              if (customScore && !isNaN(customScore)) {
                handleInputChange('score', parseInt(customScore));
              }
            }}
          >
            Other
          </button>
        </div>
      </div>
      
      <button className="btn save-btn" onClick={handleSaveHole}>
        SAVE & NEXT HOLE
      </button>
    </div>
  );
};

export default TrackRound;