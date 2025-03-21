// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRounds, createRound } from '../utils/localStorage';
import { calculateOverallStats } from '../utils/statCalculations';
import DataManager from '../components/common/DataManager';

const Home = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [currentRoundId, setCurrentRoundId] = useState(null);
  const [stats, setStats] = useState({
    fairwayHitPercentage: 0,
    girPercentage: 0,
    averagePutts: 0,
    upAndDownPercentage: 0,
    sandSavePercentage: 0
  });

  useEffect(() => {
    // Load rounds from localStorage
    const storedRounds = getRounds();
    setRounds(storedRounds);
    
    // Set the current round ID to the most recent round if any exist
    if (storedRounds.length > 0) {
      const sortedRounds = [...storedRounds].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setCurrentRoundId(sortedRounds[0].id);
    }
    
    // Calculate overall stats
    setStats(calculateOverallStats(storedRounds));
  }, []);

  const handleStartNewRound = (holeCount) => {
    // Create a new round
    const newRound = createRound({
      courseName: 'My Golf Course',
      date: new Date().toISOString(),
      holeCount: holeCount // Store whether it's 9 or 18 holes
    });
    
    // Update current round ID
    setCurrentRoundId(newRound.id);
    
    // Navigate to track the round - starting with hole 1
    navigate(`/track/${newRound.id}/1`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="home-container">
      <div className="dashboard-header">
        <h1>Golf Stats Tracker</h1>
      </div>
      
      <div className="home-actions">
        <div className="btn-group">
          <button 
            className="btn" 
            onClick={() => handleStartNewRound(9)}
          >
            Start 9 Holes
          </button>
          <button 
            className="btn" 
            onClick={() => handleStartNewRound(18)}
          >
            Start 18 Holes
          </button>
        </div>
        
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/rounds')}
        >
          View Previous Rounds
        </button>
      </div>
      
      <div className="data-management">
        <DataManager currentRoundId={currentRoundId} />
      </div>
      
      <div className="stats-summary">
        <h2>Your Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats.fairwayHitPercentage.toFixed(1)}%</div>
              <div className="stat-title">Fairways Hit</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏌️‍♂️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.girPercentage.toFixed(1)}%</div>
              <div className="stat-title">GIR</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⛳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averagePutts.toFixed(1)}</div>
              <div className="stat-title">Putts/Hole</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{stats.upAndDownPercentage.toFixed(1)}%</div>
              <div className="stat-title">Up & Down</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="recent-rounds">
        <h2>Recent Rounds</h2>
        {rounds.length === 0 ? (
          <p>You haven't tracked any rounds yet. Start a new round to begin collecting stats!</p>
        ) : (
          <div className="rounds-grid">
            {rounds.slice(0, 5).map(round => (
              <div key={round.id} className="round-card">
                <div className="round-header">
                  <h3>{round.courseName}</h3>
                  <span>{formatDate(round.date)}</span>
                </div>
                <div className="round-stats">
                  <p>Holes played: {round.holes.length}/{round.holeCount || 18}</p>
                  {round.holes.length > 0 && (
                    <p>Score: {round.holes.reduce((sum, hole) => sum + hole.score, 0)}</p>
                  )}
                </div>
                <div className="round-actions">
                  <Link to={`/round/${round.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  {round.holes.length < (round.holeCount || 18) && (
                    <Link to={`/track/${round.id}/${round.holes.length + 1}`} className="btn">
                      Continue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;