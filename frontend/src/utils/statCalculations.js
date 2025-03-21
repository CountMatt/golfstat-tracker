// src/utils/statCalculations.js

// Calculate overall statistics
export const calculateOverallStats = (rounds) => {
  if (!rounds || rounds.length === 0) {
    return {
      fairwayHitPercentage: 0,
      girPercentage: 0,
      averagePutts: 0,
      upAndDownPercentage: 0,
      sandSavePercentage: 0
    };
  }

  let totalHoles = 0;
  let fairwaysHit = 0;
  let fairwaysPlayed = 0;
  let greensInRegulation = 0;
  let totalPutts = 0;
  let upAndDownAttempts = 0;
  let upAndDownsSuccessful = 0;
  let sandSaveAttempts = 0;
  let sandSavesSuccessful = 0;

  rounds.forEach(round => {
    round.holes.forEach(hole => {
      totalHoles++;
      
      // Fairway hit stats (exclude Par 3 holes)
      if (hole.fairwayHit !== undefined && hole.par > 3) {
        fairwaysPlayed++;
        if (hole.fairwayHit === 'hit') {
          fairwaysHit++;
        }
      }
      
      // GIR stats
      if (hole.girHit) {
        greensInRegulation++;
      }
      
      // Putting stats
      if (hole.putts) {
        totalPutts += hole.putts;
      }
      
      // Up & Down stats
      if (hole.upAndDownAttempt) {
        upAndDownAttempts++;
        if (hole.upAndDownSuccess) {
          upAndDownsSuccessful++;
        }
      }
      
      // Sand save stats
      if (hole.fromSand) {
        sandSaveAttempts++;
        if (hole.upAndDownSuccess) {
          sandSavesSuccessful++;
        }
      }
    });
  });

  return {
    fairwayHitPercentage: fairwaysPlayed > 0 ? (fairwaysHit / fairwaysPlayed) * 100 : 0,
    girPercentage: totalHoles > 0 ? (greensInRegulation / totalHoles) * 100 : 0,
    averagePutts: totalHoles > 0 ? totalPutts / totalHoles : 0,
    upAndDownPercentage: upAndDownAttempts > 0 ? (upAndDownsSuccessful / upAndDownAttempts) * 100 : 0,
    sandSavePercentage: sandSaveAttempts > 0 ? (sandSavesSuccessful / sandSaveAttempts) * 100 : 0
  };
};

// Calculate statistics for a specific round
export const calculateRoundStats = (round) => {
  if (!round || !round.holes || round.holes.length === 0) {
    return {
      fairwayHitPercentage: 0,
      girPercentage: 0,
      averagePutts: 0,
      upAndDownPercentage: 0,
      sandSavePercentage: 0,
      totalScore: 0,
      toPar: 0
    };
  }

  let fairwaysHit = 0;
  let fairwaysPlayed = 0;
  let greensInRegulation = 0;
  let totalPutts = 0;
  let upAndDownAttempts = 0;
  let upAndDownsSuccessful = 0;
  let sandSaveAttempts = 0;
  let sandSavesSuccessful = 0;
  let totalScore = 0;
  let totalPar = 0;

  round.holes.forEach(hole => {
    // Fairway hit stats (exclude Par 3 holes)
    if (hole.fairwayHit !== undefined && hole.par > 3) {
      fairwaysPlayed++;
      if (hole.fairwayHit === 'hit') {
        fairwaysHit++;
      }
    }
    
    // GIR stats
    if (hole.girHit) {
      greensInRegulation++;
    }
    
    // Putting stats
    if (hole.putts) {
      totalPutts += hole.putts;
    }
    
    // Up & Down stats
    if (hole.upAndDownAttempt) {
      upAndDownAttempts++;
      if (hole.upAndDownSuccess) {
        upAndDownsSuccessful++;
      }
    }
    
    // Sand save stats
    if (hole.fromSand) {
      sandSaveAttempts++;
      if (hole.upAndDownSuccess) {
        sandSavesSuccessful++;
      }
    }
    
    // Score stats
    if (hole.score) {
      totalScore += hole.score;
    }
    
    if (hole.par) {
      totalPar += hole.par;
    }
  });

  return {
    fairwayHitPercentage: fairwaysPlayed > 0 ? (fairwaysHit / fairwaysPlayed) * 100 : 0,
    girPercentage: round.holes.length > 0 ? (greensInRegulation / round.holes.length) * 100 : 0,
    averagePutts: round.holes.length > 0 ? totalPutts / round.holes.length : 0,
    upAndDownPercentage: upAndDownAttempts > 0 ? (upAndDownsSuccessful / upAndDownAttempts) * 100 : 0,
    sandSavePercentage: sandSaveAttempts > 0 ? (sandSavesSuccessful / sandSaveAttempts) * 100 : 0,
    totalScore,
    toPar: totalScore - totalPar
  };
};

// Calculate averages for specific clubs
export const calculateClubStats = (rounds) => {
  if (!rounds || rounds.length === 0) {
    return {};
  }
  
  const clubStats = {};
  
  rounds.forEach(round => {
    round.holes.forEach(hole => {
      // Process tee shots
      if (hole.teeClub) {
        if (!clubStats[hole.teeClub]) {
          clubStats[hole.teeClub] = { 
            totalDistance: 0, 
            count: 0,
            fairwayHits: 0,
            fairwayAttempts: 0
          };
        }
        
        clubStats[hole.teeClub].count++;
        
        // Track fairway hits for this club
        if (hole.par > 3 && hole.fairwayHit !== undefined) {
          clubStats[hole.teeClub].fairwayAttempts++;
          if (hole.fairwayHit === 'hit') {
            clubStats[hole.teeClub].fairwayHits++;
          }
        }
      }
      
      // Process approach shots
      if (hole.approachClub && hole.approachDistance) {
        if (!clubStats[hole.approachClub]) {
          clubStats[hole.approachClub] = { 
            totalDistance: 0, 
            count: 0,
            girHits: 0,
            girAttempts: 0
          };
        }
        
        clubStats[hole.approachClub].totalDistance += hole.approachDistance;
        clubStats[hole.approachClub].count++;
        clubStats[hole.approachClub].girAttempts++;
        
        if (hole.girHit) {
          clubStats[hole.approachClub].girHits++;
        }
      }
    });
  });
  
  // Calculate averages and percentages
  Object.keys(clubStats).forEach(club => {
    const stats = clubStats[club];
    
    // Calculate averages
    if (stats.count > 0) {
      stats.avgDistance = stats.totalDistance / stats.count;
    }
    
    // Calculate percentages
    if (stats.fairwayAttempts > 0) {
      stats.fairwayHitPercentage = (stats.fairwayHits / stats.fairwayAttempts) * 100;
    }
    
    if (stats.girAttempts > 0) {
      stats.girPercentage = (stats.girHits / stats.girAttempts) * 100;
    }
  });
  
  return clubStats;
};