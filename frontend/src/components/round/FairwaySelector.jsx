// src/components/round/FairwaySelector.jsx
const FairwaySelector = ({ selected, onChange }) => {
    return (
      <div className="fairway-selector">
        <button 
          className={`fairway-section left ${selected === 'left' ? 'selected' : ''}`}
          onClick={() => onChange('left')}
        >
          Left
        </button>
        <button 
          className={`fairway-section hit ${selected === 'hit' ? 'selected' : ''}`}
          onClick={() => onChange('hit')}
        >
          Hit
        </button>
        <button 
          className={`fairway-section right ${selected === 'right' ? 'selected' : ''}`}
          onClick={() => onChange('right')}
        >
          Right
        </button>
      </div>
    );
  };
  
  export default FairwaySelector;