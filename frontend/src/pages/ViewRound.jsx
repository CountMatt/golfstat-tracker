// src/pages/ViewRound.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRound, deleteRound } from '../utils/localStorage';
import { calculateRoundStats } from '../utils/statCalculations';
import StatCard from '../components/stats/StatCard';

const ViewRound = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load round data
    const roundData = getRound(roundId);
    if (!roundData) {
      // Handle invalid round ID
      navigate('/');
      return;
    }
    
    setRound(roundData);
    
    // Calculate stats for this round
    setStats(calculateRoundStats(roundData));
  }, [roundId, navigate]);

  const handleDeleteRound = () => {
    if (window.confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      deleteRound(roundId);
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!round || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="view-round-container">
      <div className="round-header">
        <div>
          <h1>{round.courseName}</h1>
          <p className="round-date">{formatDate(round.date)}</p>
        </div>
        <div className="round-actions">
          {round.holes.length < 18 && (
            <Link to={`/track/${roundId}/${round.holes.length + 1}`} className="btn">
              Continue Round
            </Link>
          )}
          <button className="btn btn-danger" onClick={handleDeleteRound}>
            Delete Round
          </button>
        </div>
      </div>
      
      <div className="round-stats-summary">
        <h2>Round Statistics</h2>
        <div className="stats-grid">
          <StatCard 
            title="Total Score" 
            value={stats.totalScore} 
            icon="🏆" 
          />
          <StatCard 
            title="To Par" 
            value={stats.toPar > 0 ? `+${stats.toPar}` : stats.toPar} 
            icon="⛳" 
          />
          <StatCard 
            title="Fairways Hit" 
            value={`${stats.fairwayHitPercentage.toFixed(1)}%`} 
            icon="🎯" 
          />
          <StatCard 
            title="GIR" 
            value={`${stats.girPercentage.toFixed(1)}%`} 
            icon="🏌️‍♂️" 
          />
          <StatCard 
            title="Putts/Hole" 
            value={stats.averagePutts.toFixed(1)} 
            icon="🥏" 
          />
        </div>
      </div>
      
      <div className="scorecard">
        <h2>Scorecard</h2>
        <div className="scorecard-table">
          <table>
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>Score</th>
                <th>+/-</th>
                <th>FIR</th>
                <th>GIR</th>
                <th>Putts</th>
              </tr>
            </thead>
            <tbody>
              {round.holes.map(hole => {
                const scoreToPar = hole.score - hole.par;
                let scoreClass = 'par';
                if (scoreToPar < 0) scoreClass = 'under-par';
                if (scoreToPar > 0) scoreClass = 'over-par';
                
                return (
                  <tr key={hole.number}>
                    <td>{hole.number}</td>
                    <td>{hole.par}</td>
                    <td className={scoreClass}>{hole.score}</td>
                    <td className={scoreClass}>
                      {scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                    </td>
                    <td>
                      {hole.fairwayHit === 'hit' && '✓'}
                      {hole.fairwayHit === 'left' && 'L'}
                      {hole.fairwayHit === 'right' && 'R'}
                    </td>
                    <td>{hole.girHit ? '✓' : '✗'}</td>
                    <td>{hole.putts}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th>
                  {round.holes.reduce((sum, hole) => sum + hole.par, 0)}
                </th>
                <th>
                  {round.holes.reduce((sum, hole) => sum + hole.score, 0)}
                </th>
                <th>
                  {stats.toPar > 0 ? `+${stats.toPar}` : stats.toPar}
                </th>
                <th>
                  {`${stats.fairwayHitPercentage.toFixed(0)}%`}
                </th>
                <th>
                  {`${stats.girPercentage.toFixed(0)}%`}
                </th>
                <th>
                  {round.holes.reduce((sum, hole) => sum + hole.putts, 0)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <div className="back-button">
        <Link to="/" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ViewRound;