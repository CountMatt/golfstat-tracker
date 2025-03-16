// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Home from './pages/Home';
import TrackRound from './pages/TrackRound';
import ViewRound from './pages/ViewRound';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track/:roundId" element={<TrackRound />} />
            <Route path="/track/:roundId/:holeNumber" element={<TrackRound />} />
            <Route path="/round/:roundId" element={<ViewRound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;