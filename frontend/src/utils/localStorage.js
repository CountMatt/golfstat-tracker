// src/utils/localStorage.js
const STORAGE_KEY = 'golf-tracker-data';

// Base data structure
const initializeStorage = () => {
  const defaultData = {
    rounds: [],
    settings: {
      units: 'meters' // or 'yards'
    }
  };
  
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  }
  
  return getStorageData();
};

// Get all data
const getStorageData = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return data || initializeStorage();
  } catch (error) {
    console.error('Error parsing golf tracker data', error);
    return initializeStorage();
  }
};

// Get all rounds
export const getRounds = () => {
  const data = getStorageData();
  return data.rounds;
};

// Get specific round
export const getRound = (roundId) => {
  const rounds = getRounds();
  return rounds.find(round => round.id === roundId);
};

// Create new round
export const createRound = (roundData) => {
  const data = getStorageData();
  const newRound = {
    id: Date.now().toString(), // Simple ID generation
    date: new Date().toISOString(),
    ...roundData,
    holes: []
  };
  
  data.rounds.push(newRound);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  return newRound;
};

// Add or update hole data
export const updateHoleData = (roundId, holeNumber, holeData) => {
  const data = getStorageData();
  const roundIndex = data.rounds.findIndex(round => round.id === roundId);
  
  if (roundIndex === -1) {
    throw new Error('Round not found');
  }
  
  // Find if hole already exists
  const holeIndex = data.rounds[roundIndex].holes.findIndex(
    hole => hole.number === holeNumber
  );
  
  if (holeIndex === -1) {
    // Add new hole
    data.rounds[roundIndex].holes.push({
      number: holeNumber,
      ...holeData
    });
  } else {
    // Update existing hole
    data.rounds[roundIndex].holes[holeIndex] = {
      ...data.rounds[roundIndex].holes[holeIndex],
      ...holeData
    };
  }
  
  // Sort holes by number
  data.rounds[roundIndex].holes.sort((a, b) => a.number - b.number);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data.rounds[roundIndex];
};

// Delete round
export const deleteRound = (roundId) => {
  const data = getStorageData();
  data.rounds = data.rounds.filter(round => round.id !== roundId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get settings
export const getSettings = () => {
  const data = getStorageData();
  return data.settings;
};

// Update settings
export const updateSettings = (newSettings) => {
  const data = getStorageData();
  data.settings = {
    ...data.settings,
    ...newSettings
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data.settings;
};



// Export all golf data as JSON
export const exportData = () => {
  const data = getStorageData();
  const dataStr = JSON.stringify(data);
  
  // Create a blob and download link
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger it
  const a = document.createElement('a');
  a.href = url;
  a.download = `golf-stats-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
};

// Import data from JSON file
export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        resolve(true);
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Clear all rounds except the current one
export const clearOldRounds = (currentRoundId) => {
  const data = getStorageData();
  
  // Keep only settings and the current round
  const currentRound = data.rounds.find(round => round.id === currentRoundId);
  
  data.rounds = currentRound ? [currentRound] : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  return true;
};



// Initialize storage on module load
initializeStorage();