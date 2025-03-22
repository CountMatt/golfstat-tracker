// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRounds, createRound, clearOldRounds, exportData, importData } from '../utils/localStorage';
import { calculateOverallStats } from '../utils/statCalculations';

// For circular progress indicators
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Icons
import GolfCourseIcon from '../components/icons/GolfCourseIcon';
import AddIcon from '../components/icons/AddIcon';
import UploadIcon from '../components/icons/UploadIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ArrowForwardIcon from '../components/icons/ArrowForwardIcon';

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
  const [message, setMessage] = useState(null);
  const [importing, setImporting] = useState(false);

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
    try {
      // Create a new round
      const newRound = createRound({
        courseName: 'My Golf Course',
        date: new Date().toISOString(),
        holeCount: holeCount
      });
      
      // Update current round ID
      setCurrentRoundId(newRound.id);
      
      // Navigate to track the round - starting with hole 1
      navigate(`/track/${newRound.id}/1`);
    } catch (error) {
      console.error("Error creating round:", error);
      setMessage({ type: 'error', text: 'Error creating new round. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExportData = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Data exported successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImporting(true);
    setMessage(null);
    
    try {
      await importData(file);
      setMessage({ type: 'success', text: 'Data imported successfully' });
      setTimeout(() => {
        window.location.reload(); // Refresh to show imported data
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleClearOldRounds = () => {
    if (window.confirm('Are you sure you want to remove all rounds except the current one? This helps save space on your device.')) {
      clearOldRounds(currentRoundId);
      setMessage({ type: 'success', text: 'Old rounds cleared' });
      
      // Update the rounds state to reflect changes
      const remainingRounds = getRounds();
      setRounds(remainingRounds);
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate the score to par
  const calculateScoreToPar = (round) => {
    if (!round || !round.holes || round.holes.length === 0) return "N/A";
    
    let totalScore = 0;
    let totalPar = 0;
    
    round.holes.forEach(hole => {
      totalScore += hole.score || 0;
      totalPar += hole.par || 0;
    });
    
    const diff = totalScore - totalPar;
    if (diff === 0) return "E";
    return diff > 0 ? `+${diff}` : diff;
  };
  
  // Calculate total score for a round
  const calculateTotalScore = (round) => {
    if (!round || !round.holes || round.holes.length === 0) return "N/A";
    return round.holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  };

  // Get color based on performance
  const getPerformanceColor = (value, metric) => {
    switch(metric) {
      case 'fairway':
        return value >= 65 ? '#4CAF50' : value >= 50 ? '#FFC107' : '#F44336';
      case 'gir':
        return value >= 60 ? '#4CAF50' : value >= 40 ? '#FFC107' : '#F44336';
      case 'putts':
        // Lower is better for putts
        return value <= 1.7 ? '#4CAF50' : value <= 2 ? '#FFC107' : '#F44336';
      case 'updown':
        return value >= 45 ? '#4CAF50' : value >= 30 ? '#FFC107' : '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <div className="home-container">
      {/* Navigation header is already in App.jsx */}
      
      {/* Message notification */}
      {message && (
        <div className={`message-notification ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="dashboard-content">
        {/* Quick Start Section */}
        <div className="card quick-start-card">
          <h2 className="card-title">Start Tracking</h2>
          
          <div className="button-grid">
            <button 
              className="btn btn-primary"
              onClick={() => handleStartNewRound(18)}
            >
              <AddIcon />
              <span>New 18-Hole Round</span>
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => handleStartNewRound(9)}
            >
              <AddIcon />
              <span>New 9-Hole Round</span>
            </button>
          </div>
        </div>
        
        {/* Stats Overview Section */}
        <div className="stats-section">
          <h2 className="section-title">Your Performance Stats</h2>
          
          <div className="stats-grid">
            {/* Fairways Hit Stat */}
            <div className="stat-card">
              <div className="stat-circle">
                <CircularProgressbar
                  value={stats.fairwayHitPercentage}
                  text={`${stats.fairwayHitPercentage.toFixed(1)}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: getPerformanceColor(stats.fairwayHitPercentage, 'fairway'),
                    textColor: getPerformanceColor(stats.fairwayHitPercentage, 'fairway'),
                    trailColor: '#e9f0f5'
                  })}
                />
              </div>
              <div className="stat-label">Fairways Hit</div>
            </div>
            
            {/* GIR Stat */}
            <div className="stat-card">
              <div className="stat-circle">
                <CircularProgressbar
                  value={stats.girPercentage}
                  text={`${stats.girPercentage.toFixed(1)}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: getPerformanceColor(stats.girPercentage, 'gir'),
                    textColor: getPerformanceColor(stats.girPercentage, 'gir'),
                    trailColor: '#e9f0f5'
                  })}
                />
              </div>
              <div className="stat-label">GIR</div>
            </div>
            
            {/* Putts/Hole Stat */}
            <div className="stat-card">
              <div className="stat-circle">
                <CircularProgressbar
                  value={Math.max(0, (4 - stats.averagePutts) / 3 * 100)}
                  text={`${stats.averagePutts.toFixed(1)}`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: getPerformanceColor(stats.averagePutts, 'putts'),
                    textColor: getPerformanceColor(stats.averagePutts, 'putts'),
                    trailColor: '#e9f0f5'
                  })}
                />
              </div>
              <div className="stat-label">Putts/Hole</div>
            </div>
            
            {/* Up & Down Stat */}
            <div className="stat-card">
              <div className="stat-circle">
                <CircularProgressbar
                  value={stats.upAndDownPercentage}
                  text={`${stats.upAndDownPercentage.toFixed(1)}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: getPerformanceColor(stats.upAndDownPercentage, 'updown'),
                    textColor: getPerformanceColor(stats.upAndDownPercentage, 'updown'),
                    trailColor: '#e9f0f5'
                  })}
                />
              </div>
              <div className="stat-label">Up & Down</div>
            </div>
          </div>
        </div>
        
        {/* Recent Rounds Section */}
        <div className="card rounds-card">
          <div className="card-header">
            <h2 className="card-title">Recent Rounds</h2>
            <button className="btn btn-text">
              <span>View All</span>
              <ArrowForwardIcon />
            </button>
          </div>
          
          {rounds.length === 0 ? (
            <div className="empty-state">
              <p>You haven't tracked any rounds yet. Start a new round to begin collecting stats!</p>
            </div>
          ) : (
            <div className="round-list">
              {rounds.slice(0, 5).map((round, index) => (
                <div key={round.id} className="round-item">
                  <div className="round-info">
                    <div className="round-avatar">
                      {round.courseName.charAt(0)}
                    </div>
                    <div className="round-details">
                      <h4>{round.courseName}</h4>
                      <div className="round-meta">{formatDate(round.date)} • {round.holes.length}/{round.holeCount || 18} holes</div>
                    </div>
                  </div>
                  
                  <div className="round-score">
                    <div className="score-display">
                      <div className="score-value">{calculateTotalScore(round)}</div>
                      <div className="score-par">{calculateScoreToPar(round)}</div>
                    </div>
                    
                    <Link to={`/round/${round.id}`} className="btn btn-outline btn-small">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Data Management Section */}
        <div className="card data-card">
          <h2 className="card-title">Data Management</h2>
          
          <div className="data-actions">
            <button 
              className="btn btn-outline"
              onClick={handleExportData}
            >
              <DownloadIcon />
              <span>Export Data</span>
            </button>
            
            <label className="btn btn-outline import-btn">
              <UploadIcon />
              <span>Import Data</span>
              <input 
                type="file" 
                accept=".json"
                onChange={handleImportData}
                disabled={importing}
                style={{ display: 'none' }}
              />
            </label>
            
            <button 
              className="btn btn-danger"
              onClick={handleClearOldRounds}
            >
              <DeleteIcon />
              <span>Clear Old Rounds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;