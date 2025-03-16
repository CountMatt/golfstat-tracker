// src/components/round/PuttingInput.jsx
const PuttingInput = ({ firstPuttDistance, firstPuttRemaining, totalPutts, onChange }) => {
    return (
      <div className="putting-inputs">
        <div className="input-row">
          <label>First Putt Distance (meters):</label>
          <input 
            type="number" 
            value={firstPuttDistance || ''}
            onChange={(e) => onChange('firstPuttDistance', Number(e.target.value))}
            min="0"
            step="0.1"
          />
        </div>
        
        <div className="input-row">
          <label>Distance Remaining (meters):</label>
          <input 
            type="number" 
            value={firstPuttRemaining || ''}
            onChange={(e) => onChange('firstPuttRemaining', Number(e.target.value))}
            min="0"
            step="0.1"
            />
        </div>
      
        <div className="input-row">
         <label>Total Putts:</label>
         <div className="putt-counter">
              <button 
               className="putt-btn decrease"
                onClick={() => onChange('putts', Math.max(0, totalPutts - 1))}
           >
             -
              </button>
           <span className="putt-count">{totalPutts}</span>
              <button 
             className="putt-btn increase"
              onClick={() => onChange('putts', totalPutts + 1)}
           >
               +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuttingInput;