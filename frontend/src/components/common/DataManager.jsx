// In your DataManager.jsx component

import { useState, useEffect } from 'react';
import { syncWithServer, checkServerConnection } from '../../utils/localStorage';

const DataManager = ({ currentRoundId }) => {
  // Existing state
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Add sync state
  const [syncStatus, setSyncStatus] = useState({
    online: false,
    syncing: false,
    lastSynced: null
  });
  
  // Check connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkServerConnection();
      setSyncStatus(prev => ({ ...prev, ...status }));
    };
    
    checkConnection();
    
    // Set up periodic check (every 30 seconds)
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle sync
  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    
    try {
      const result = await syncWithServer();
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
      
      const newStatus = await checkServerConnection();
      setSyncStatus({
        ...newStatus,
        syncing: false
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to sync with server'
      });
      
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  // Render sync status
  const renderSyncStatus = () => {
    return (
      <div className="sync-status">
        <div className={`sync-indicator ${syncStatus.syncing ? 'syncing' : syncStatus.online ? '' : 'offline'}`}></div>
        <span>
          {syncStatus.syncing
            ? 'Syncing...'
            : syncStatus.online
              ? syncStatus.lastSynced
                ? `Last synced: ${new Date(syncStatus.lastSynced).toLocaleString()}`
                : 'Connected, not synced yet'
              : 'Offline'}
        </span>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleSync}
          disabled={syncStatus.syncing || !syncStatus.online}
        >
          Sync Now
        </button>
      </div>
    );
  };
  
  // ... rest of your existing code
  
  return (
    <div className="data-manager">
      <h3>Manage Data</h3>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="data-actions">
        {/* Existing buttons */}
        <button onClick={handleExport} className="btn btn-outline">
          Export Data
        </button>
        
        <label className="btn btn-outline import-btn">
          Import Data
          <input 
            type="file" 
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            disabled={importing}
          />
        </label>
        
        {currentRoundId && (
          <button onClick={handleClearOld} className="btn btn-outline danger">
            Clear Old Rounds
          </button>
        )}
      </div>
      
      {/* Add sync status section */}
      {renderSyncStatus()}
    </div>
  );
};

export default DataManager;