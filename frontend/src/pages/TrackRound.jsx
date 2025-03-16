// src/pages/TrackRound.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRound, updateHoleData } from '../utils/localStorage';
import GreenGrid from '../components/round/GreenGrid';
import FairwaySelector from '../components/round/FairwaySelector';
import PuttingInput from '../components/round/PuttingInput';

const TrackRound = () => {
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const currentHole = parseInt(holeNumber || '1');
  
  const [round, setRound] = useState(null);
  const [holeData, setHoleData] = useState({
    number: currentHole,
    par: 4, // Default par
    score: 0,
    fairwayHit: null, // 'hit', 'left', 'right'
    girHit: false,
    greenPosition: null, // 'center' or one of 8 sections if missed
    approachDistance: 0,
    approachClub: '',
    upAndDownAttempt: false,
    upAndDownSuccess: false,
    fromSand: false,
    firstPuttDistance: 0,
    firstPuttRemaining: 0,
    putts: 0
  });

  useEffect(() => {
    // Load round data
    const roundData = getRound(roundId);
    if (!roundData) {
      // Handle invalid round ID
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
        score: 0,
        fairwayHit: null,
        girHit: false,
        greenPosition: null,
        approachDistance: 0,
        approachClub: '',
        upAndDownAttempt: false,
        upAndDownSuccess: false,
        fromSand: false,
        firstPuttDistance: 0,
        firstPuttRemaining: 0,
        putts: 0
      });
    }
  }, [roundId, currentHole, navigate]);

  const handleInputChange = (field, value) => {
    setHoleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveHole = () => {
    // Save current hole data
    const updatedRound = updateHoleData(roundId, currentHole, holeData);
    setRound(updatedRound);
    
    // Navigate to next hole or summary if finished
    if (currentHole < 18) {
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

  if (!round) {
    return <div>Loading...</div>;
  }

  return (
    <div className="track-round-container">
      <div className="track-header">
        <h1>{round.courseName}</h1>
        <h2>Hole {currentHole}</h2>
      </div>
      
      <div className="hole-input-grid">
        {/* Par Selection */}
        <div className="input-section">
          <h3>Par</h3>
          <div className="par-selector">
            {[3, 4, 5].map(par => (
              <button
                key={par}
                className={`par-btn ${holeData.par === par ? 'selected' : ''}`}
                onClick={() => handleInputChange('par', par)}
              >
                {par}
              </button>
            ))}
          </div>
        </div>
        
        {/* Fairway Section */}
        <div className="input-section">
          <h3>Fairway</h3>
          <FairwaySelector
            selected={holeData.fairwayHit}
            onChange={(value) => handleInputChange('fairwayHit', value)}
          />
          
          <div className="club-input">
            <label>Club used off tee:</label>
            <select
              value={holeData.teeClub || ''}
              onChange={(e) => handleInputChange('teeClub', e.target.value)}
            >
              <option value="">Select club</option>
              <option value="Driver">Driver</option>
              <option value="5 Wood">5 Wood</option>
              <option value="3 Iron">3 Iron</option>
              <option value="4 Iron">4 Iron</option>
              <option value="5 Iron">5 Iron</option>
              <option value="6 Iron">6 Iron</option>
              <option value="7 Iron">7 Iron</option>
              <option value="8 Iron">8 Iron</option>
              <option value="9 Iron">9 Iron</option>
              <option value="PW">PW</option>
              <option value="52">52</option>
              <option value="56">56</option>
              <option value="58">58</option>
            </select>
          </div>
        </div>
        
        {/* Green Section */}
        <div className="input-section">
          <h3>Green in Regulation</h3>
          <div className="gir-selector">
            <button
              className={`gir-btn ${holeData.girHit ? 'selected' : ''}`}
              onClick={() => handleInputChange('girHit', true)}
            >
              Hit
            </button>
            <button
              className={`gir-btn ${holeData.girHit === false ? 'selected' : ''}`}
              onClick={() => handleInputChange('girHit', false)}
            >
              Missed
            </button>
          </div>
          
          {holeData.girHit === false && (
            <>
              <h4>Green Miss Location</h4>
              <GreenGrid
                selected={holeData.greenPosition}
                onChange={(value) => handleInputChange('greenPosition', value)}
              />
              
              <div className="approach-inputs">
                <div>
                  <label>Approach Distance (meters):</label>
                  <input
                    type="number"
                    value={holeData.approachDistance || ''}
                    onChange={(e) => handleInputChange('approachDistance', Number(e.target.value))}
                    min="0"
                  />
                </div>
                
                <div>
                  <label>Club Used:</label>
                  <select
                    value={holeData.approachClub || ''}
                    onChange={(e) => handleInputChange('approachClub', e.target.value)}
                  >
                    <option value="">Select club</option>
                    <option value="5 Wood">5 Wood</option>
                    <option value="3 Iron">3 Iron</option>
                    <option value="4 Iron">4 Iron</option>
                    <option value="5 Iron">5 Iron</option>
                    <option value="6 Iron">6 Iron</option>
                    <option value="7 Iron">7 Iron</option>
                    <option value="8 Iron">8 Iron</option>
                    <option value="9 Iron">9 Iron</option>
                    <option value="PW">PW</option>
                    <option value="52">52</option>
                    <option value="56">56</option>
                    <option value="58">58</option>
                  </select>
                </div>
                
                <div className="sand-shot">
                  <label>
                    <input
                      type="checkbox"
                      checked={holeData.fromSand || false}
                      onChange={(e) => handleInputChange('fromSand', e.target.checked)}
                    />
                    From bunker
                  </label>
                </div>
                
                <div className="up-and-down">
                  <label>Up & Down:</label>
                  <div className="up-down-btns">
                    <button
                      className={holeData.upAndDownSuccess ? 'selected' : ''}
                      onClick={() => {
                        handleInputChange('upAndDownAttempt', true);
                        handleInputChange('upAndDownSuccess', true);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className={holeData.upAndDownAttempt && !holeData.upAndDownSuccess ? 'selected' : ''}
                      onClick={() => {
                        handleInputChange('upAndDownAttempt', true);
                        handleInputChange('upAndDownSuccess', false);
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Putting Section */}
        <div className="input-section">
          <h3>Putting</h3>
          <PuttingInput
            firstPuttDistance={holeData.firstPuttDistance}
            firstPuttRemaining={holeData.firstPuttRemaining}
            totalPutts={holeData.putts}
            onChange={(field, value) => handleInputChange(field, value)}
          />
        </div>
        
        {/* Score Section */}
        <div className="input-section">
          <h3>Final Score</h3>
          <div className="score-input">
            <button 
              className="score-btn decrease"
              onClick={() => handleInputChange('score', Math.max(1, (holeData.score || 0) - 1))}
            >
              -
            </button>
            <input
              type="number"
              value={holeData.score || ''}
              onChange={(e) => handleInputChange('score', Number(e.target.value))}
              min="1"
            />
            <button 
              className="score-btn increase"
              onClick={() => handleInputChange('score', (holeData.score || 0) + 1)}
            >
              +
            </button>
          </div>
          
          {holeData.score && holeData.par && (
            <div className="score-relative">
              {holeData.score < holeData.par && `${holeData.par - holeData.score} Under Par`}
              {holeData.score === holeData.par && 'Par'}
              {holeData.score > holeData.par && `${holeData.score - holeData.par} Over Par`}
            </div>
          )}
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button 
          className="btn btn-outline"
          onClick={handlePrevHole}
          disabled={currentHole <= 1}
        >
          Previous Hole
        </button>
        
        <button 
          className="btn"
          onClick={handleSaveHole}
        >
          {currentHole < 18 ? 'Save & Next Hole' : 'Finish Round'}
        </button>
      </div>
    </div>
  );
};

export default TrackRound;