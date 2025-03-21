// src/components/round/FairwaySelector.jsx
const FairwaySelector = ({ selected, onChange }) => {
  return (
    <div className="button-row">
      <button 
        className={`option-btn ${selected === 'left' ? 'selected' : ''}`}
        onClick={() => onChange('left')}
      >
        Miss Left
      </button>
      <button 
        className={`option-btn ${selected === 'hit' ? 'selected' : ''}`}
        onClick={() => onChange('hit')}
      >
        Hit
      </button>
      <button 
        className={`option-btn ${selected === 'right' ? 'selected' : ''}`}
        onClick={() => onChange('right')}
      >
        Miss Right
      </button>
    </div>
  );
};

export default FairwaySelector;