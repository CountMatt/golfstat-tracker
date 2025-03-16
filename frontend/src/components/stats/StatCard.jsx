// src/components/stats/StatCard.jsx
const StatCard = ({ title, value, icon }) => {
    return (
      <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
        </div>
      </div>
    );
  };
  
  export default StatCard;