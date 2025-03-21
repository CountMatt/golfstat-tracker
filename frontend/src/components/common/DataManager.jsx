// src/components/common/DataManager.jsx
import React, { useState } from 'react';
import { exportData, importData, clearOldRounds } from '../../utils/localStorage';

const DataManager = ({ currentRoundId }) => {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleExport = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Data exported successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };
  
  const handleImport = async (event) => {
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
    } finally {
      setImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  const handleClearOld = () => {
    if (window.confirm('Are you sure you want to remove all rounds except the current one? This helps save space on your device.')) {
      clearOldRounds(currentRoundId);
      setMessage({ type: 'success', text: 'Old rounds cleared' });
      setTimeout(() => {
        window.location.reload(); // Refresh to show changes
      }, 1500);
    }
  };
  
  // This will be useful for future MongoDB integration
  const renderSyncStatus = () => {
    return (
      <div className="sync-status">
        {/* This section is for future MongoDB integration */}
        {/*
        <div className="sync-indicator"></div>
        <span>All data synced</span>
        <button className="btn btn-outline btn-sm">Sync Now</button>
        */}
      </div>
    );
  };
  
  return (
    <div className="data-manager">
      <h3>Manage Data</h3>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="data-actions">
        <button 
          onClick={handleExport}
          className="btn btn-outline"
        >
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
          <button 
            onClick={handleClearOld}
            className="btn btn-outline danger"
          >
            Clear Old Rounds
          </button>
        )}
      </div>
      
      {renderSyncStatus()}
    </div>
  );
};

export default React.memo(DataManager);