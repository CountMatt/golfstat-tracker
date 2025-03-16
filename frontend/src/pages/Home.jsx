// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRounds, createRound } from '../utils/localStorage';
import { calculateOverallStats } from '../utils/statCalculations';
import StatCard from '../components/stats/StatCard.jsx';
import DataManager from '../components/common/DataManager';

const Home = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
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
    
    // Calculate overall stats
    setStats(calculateOverallStats(storedRounds));
  }, []);

  const handleStartNewRound = () => {
    // Create a new round
    const newRound = createRound({
      courseName: 'My Golf Course', // Default name or you could add a prompt for course name
      date: new Date().toISOString()
    });
    
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
        <h1>My Golf Stats</h1>
        <button 
          onClick={handleStartNewRound} 
          className="btn"
        >
          Start New Round
        </button>
      </div>
      
      <div className="stats-summary">
        <h2>Overall Statistics</h2>
        <div className="stats-grid">
          <StatCard 
            title="Fairways Hit" 
            value={`${stats.fairwayHitPercentage.toFixed(1)}%`} 
            icon="🎯" 
          />
          <StatCard 
            title="Greens in Regulation" 
            value={`${stats.girPercentage.toFixed(1)}%`} 
            icon="🏌️‍♂️" 
          />
          <StatCard 
            title="Avg. Putts per Hole" 
            value={stats.averagePutts.toFixed(1)} 
            icon="⛳" 
          />
          <StatCard 
            title="Up & Down %" 
            value={`${stats.upAndDownPercentage.toFixed(1)}%`} 
            icon="📈" 
          />
          <StatCard 
            title="Sand Save %" 
            value={`${stats.sandSavePercentage.toFixed(1)}%`} 
            icon="🏖️" 
          />
        </div>
        <div className="data-management">
          <DataManager currentRoundId={currentRoundId} />
        </div>
      </div>
      
      <div className="recent-rounds">
        <h2>Recent Rounds</h2>
        {rounds.length === 0 ? (
          <p>You haven't tracked any rounds yet. Start a new round to begin collecting stats!</p>
        ) : (
          <div className="rounds-grid">
            {rounds.slice(-5).reverse().map(round => (
              <div key={round.id} className="round-card">
                <div className="round-header">
                  <h3>{round.courseName}</h3>
                  <span>{formatDate(round.date)}</span>
                </div>
                <div className="round-stats">
                  <p>Holes played: {round.holes.length}</p>
                  {round.holes.length === 18 && (
                    <p>Total score: {round.holes.reduce((sum, hole) => sum + hole.score, 0)}</p>
                  )}
                </div>
                <div className="round-actions">
                  <Link to={`/round/${round.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  {round.holes.length < 18 && (
                    <Link to={`/track/${round.id}/${round.holes.length + 1}`} className="btn">
                      Continue Round
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