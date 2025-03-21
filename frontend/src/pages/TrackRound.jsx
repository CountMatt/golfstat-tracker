// src/pages/TrackRound.jsx
import { useState, useEffect } from 'react';
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
    par: 4, // Default par
    score: 4, // Default to par
    fairwayHit: null, // 'hit', 'left', 'right'
    teeClub: '', // Club used off the tee
    girHit: false,
    greenPosition: null,
    approachDistance: 0,
    approachClub: '',
    firstPuttDistance: 0,
    putts: 2
  });

  useEffect(() => {
    // Load round data
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
      // Reset for new hole
      setHoleData({
        number: currentHole,
        par: 4,
        score: 4, // Default to par
        fairwayHit: null,
        girHit: false,
        greenPosition: null,
        putts: 2 // Default to 2 putts
      });
    }
  }, [roundId, currentHole, navigate]);

  const handleInputChange = (field, value) => {
    setHoleData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto update score when par changes
    if (field === 'par') {
      setHoleData(prev => ({
        ...prev,
        score: value // Default score to par
      }));
    }
    
    // Update GIR when greenPosition changes
    if (field === 'greenPosition') {
      const girHit = value === 'center';
      setHoleData(prev => ({
        ...prev,
        girHit
      }));
    }
  };

  const handleSaveHole = () => {
    // Save current hole data
    const updatedRound = updateHoleData(roundId, currentHole, holeData);
    setRound(updatedRound);
    
    // Navigate to next hole or summary if finished
    if (currentHole < (round.holeCount || 18)) {
      navigate(`/track/${roundId}/${currentHole + 1}`);
    } else {
      navigate(`/round/${roundId}`);
    }
  };

  const handlePrevHole = () => {
    if (currentHole > 1) {
      navigate(`/track/${roundId}/${currentHole - 1}`);
    }
  };
  
  const handleNextHole = () => {
    if (currentHole < (round.holeCount || 18)) {
      navigate(`/track/${roundId}/${currentHole + 1}`);
    }
  };

  if (!round) {
    return <div>Loading...</div>;
  }

  // Dynamic score options based on par
  const generateScoreOptions = () => {
    const par = holeData.par || 4;
    return [
      par - 1, // Birdie
      par,     // Par
      par + 1, // Bogey
      par + 2, // Double bogey
      par + 3  // Triple bogey
    ];
  };

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
      



<div className="option-group approach-section">
  <div className="option-title">GREEN IN REGULATION</div>
  <div className="gir-approach-container">
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
          <option value="7 Wood">7W</option>
          <option value="4 Iron">4i</option>
          <option value="5 Iron">5i</option>
          <option value="6 Iron">6i</option>
          <option value="7 Iron">7i</option>
          <option value="8 Iron">8i</option>
          <option value="9 Iron">9i</option>
          <option value="PW">PW</option>
          <option value="50">50</option>
          <option value="54">54</option>
          <option value="58">58</option>
        </select>
      </div>
    </div>
    <GreenGrid
      selected={holeData.greenPosition}
      onChange={(value) => handleInputChange('greenPosition', value)}
      hideText={true}
    />
  </div>
</div>

      
      
      <div className="option-group">
  <div className="option-title">PUTTING</div>
  <div className="putting-container">
    <div className="putting-inputs">
      <div>
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
    </div>
    <div className="putts-counter">
      <label>Total putts:</label>
      <div className="button-row">
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