// src/components/round/GreenGrid.jsx
const GreenGrid = ({ selected, onChange }) => {
    const positions = [
      ['long-left', 'long', 'long-right'],
      ['left', 'center', 'right'],
      ['short-left', 'short', 'short-right']
    ];
  
    return (
      <div className="green-grid">
        {positions.map((row, rowIndex) => (
          <div key={rowIndex} className="green-row">
            {row.map(position => (
              <button
                key={position}
                className={`green-section ${position} ${selected === position ? 'selected' : ''}`}
                onClick={() => onChange(position)}
                aria-label={position.replace('-', ' ')}
              >
                {position === 'center' ? 'GIR ✓' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  export default GreenGrid;