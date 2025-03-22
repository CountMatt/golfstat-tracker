// src/utils/localStorage.js
const STORAGE_KEY = 'golf-tracker-data';

// Base data structure
const initializeStorage = () => {
  const defaultData = {
    rounds: [],
    settings: {
      units: 'meters' // or 'yards'
    },
    // For future MongoDB integration
    syncStatus: {
      lastSynced: null,
      pendingChanges: false
    }
  };
  
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
  } catch (error) {
    console.error('Error initializing localStorage', error);
  }
  
  return getStorageData();
};

// Get all data
const getStorageData = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data) {
      return initializeStorage();
    }
    return data;
  } catch (error) {
    console.error('Error parsing golf tracker data', error);
    return {
      rounds: [],
      settings: { units: 'meters' },
      syncStatus: { lastSynced: null, pendingChanges: false }
    };
  }
};

// Get all rounds
export const getRounds = () => {
  try {
    const data = getStorageData();
    return data.rounds || [];
  } catch (error) {
    console.error('Error getting rounds', error);
    return [];
  }
};

// Get specific round
export const getRound = (roundId) => {
  try {
    const rounds = getRounds();
    return rounds.find(round => round.id === roundId) || null;
  } catch (error) {
    console.error('Error getting round', error);
    return null;
  }
};

// Create new round
export const createRound = (roundData) => {
  try {
    const data = getStorageData();
    const newRound = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      courseName: 'My Golf Course',
      holeCount: 18, // Default to 18 holes
      ...roundData,
      holes: [],
      // For future MongoDB integration
      syncedToServer: false,
      updatedAt: new Date().toISOString()
    };
    
    console.log("Creating new round:", newRound); // Debug log
    
    if (!data.rounds) {
      data.rounds = [];
    }
    
    data.rounds.push(newRound);
    
    // Mark that we have pending changes to sync
    if (data.syncStatus) {
      data.syncStatus.pendingChanges = true;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    return newRound;
  } catch (error) {
    console.error('Error creating round', error);
    throw new Error('Failed to create new round');
  }
};

// Add or update hole data
export const updateHoleData = (roundId, holeNumber, holeData) => {
  try {
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
    
    // Update timestamp and sync status
    data.rounds[roundIndex].updatedAt = new Date().toISOString();
    data.rounds[roundIndex].syncedToServer = false;
    
    if (data.syncStatus) {
      data.syncStatus.pendingChanges = true;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.rounds[roundIndex];
  } catch (error) {
    console.error('Error updating hole data', error);
    throw new Error('Failed to update hole data');
  }
};

// Delete round
export const deleteRound = (roundId) => {
  try {
    const data = getStorageData();
    data.rounds = data.rounds.filter(round => round.id !== roundId);
    
    // Mark pending changes
    if (data.syncStatus) {
      data.syncStatus.pendingChanges = true;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error deleting round', error);
    throw new Error('Failed to delete round');
  }
};

// Get settings
export const getSettings = () => {
  try {
    const data = getStorageData();
    return data.settings || { units: 'meters' };
  } catch (error) {
    console.error('Error getting settings', error);
    return { units: 'meters' };
  }
};

// Update settings
export const updateSettings = (newSettings) => {
  try {
    const data = getStorageData();
    data.settings = {
      ...data.settings,
      ...newSettings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.settings;
  } catch (error) {
    console.error('Error updating settings', error);
    throw new Error('Failed to update settings');
  }
};

// Export data as JSON
export const exportData = () => {
  try {
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
  } catch (error) {
    console.error('Error exporting data', error);
    throw new Error('Failed to export data');
  }
};

// Import data from JSON file
export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const currentData = getStorageData();
        
        // Merge the rounds instead of replacing them
        const existingIds = currentData.rounds.map(round => round.id);
        const newRounds = importedData.rounds.filter(round => !existingIds.includes(round.id));
        
        // Add only new rounds to the existing data
        currentData.rounds = [...currentData.rounds, ...newRounds];
        
        // Mark that we have pending changes to sync
        if (currentData.syncStatus) {
          currentData.syncStatus.pendingChanges = true;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        resolve(true);
      } catch (error) {
        console.error('Error importing data', error);
        reject(new Error('Invalid file format'));
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Clear old rounds except the current one
export const clearOldRounds = (currentRoundId) => {
  try {
    const data = getStorageData();
    
    // Keep only settings and the current round
    const currentRound = data.rounds.find(round => round.id === currentRoundId);
    
    data.rounds = currentRound ? [currentRound] : [];
    
    if (data.syncStatus) {
      data.syncStatus.pendingChanges = true;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('Error clearing old rounds', error);
    throw new Error('Failed to clear old rounds');
  }
};

// Get sync status
export const getSyncStatus = () => {
  try {
    const data = getStorageData();
    return data.syncStatus || { lastSynced: null, pendingChanges: false };
  } catch (error) {
    console.error('Error getting sync status', error);
    return { lastSynced: null, pendingChanges: false };
  }
};

// Initialize storage on module load
initializeStorage();


// Add this to your src/utils/localStorage.js

// Import axios for API calls
import axios from 'axios';

const API_URL = 'http://localhost:5001/api'; // Or your server URL

// Create an API instance with proper error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add a timeout to prevent hanging requests
});


export const syncWithServer = async () => {
  try {
    console.log('Starting sync with server...');
    const data = getStorageData();
    const syncResults = {
      success: true,
      totalSynced: 0,
      errors: []
    };

    // Sync rounds
    console.log(`Attempting to sync ${data.rounds.length} rounds`);
    for (const round of data.rounds) {
      try {
        // Convert localStorage format to server format
        const serverRound = {
          clientId: round.id,
          date: round.date,
          courseName: round.courseName,
          holeCount: round.holeCount || 18,
          holes: round.holes
        };

        console.log(`Syncing round ${round.id} (${round.courseName})`);
        
        // Send to server
        const response = await api.post('/rounds', serverRound);
        
        // Mark as synced
        round.syncedToServer = true;
        round.lastSynced = new Date().toISOString();
        
        syncResults.totalSynced++;
        console.log(`Successfully synced round ${round.id}`);
      } catch (error) {
        console.error(`Failed to sync round ${round.id}:`, error);
        syncResults.errors.push({ id: round.id, error: error.message || 'Unknown error' });
        syncResults.success = false;
      }
    }

    // Sync settings
    try {
      console.log('Syncing settings...');
      await api.post('/settings', data.settings);
      console.log('Settings synced successfully');
    } catch (error) {
      console.error('Failed to sync settings:', error);
      syncResults.errors.push({ type: 'settings', error: error.message || 'Unknown error' });
      syncResults.success = false;
    }

    // Update sync status
    data.syncStatus = {
      lastSynced: new Date().toISOString(),
      pendingChanges: syncResults.errors.length > 0
    };

    // Save updated data back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const message = syncResults.success 
      ? `Successfully synced ${syncResults.totalSynced} rounds` 
      : `Synced ${syncResults.totalSynced} rounds with ${syncResults.errors.length} errors`;
    
    console.log('Sync complete:', message);
    
    return {
      success: syncResults.success,
      message: message
    };
  } catch (error) {
    console.error('Error syncing with server:', error);
    return {
      success: false,
      message: 'Failed to sync with server: ' + (error.message || 'Unknown error')
    };
  }
};

// Enhanced server connection check
export const checkServerConnection = async () => {
  try {
    console.log('Checking server connection...');
    const response = await api.get('/sync/status');
    console.log('Server is online:', response.data);
    return {
      online: true,
      lastSynced: response.data.lastSynced
    };
  } catch (error) {
    console.error('Server connection check failed:', error);
    return {
      online: false,
      lastSynced: null
    };
  }
};