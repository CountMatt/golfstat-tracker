/**
 * Calculate distance between two points using the Haversine formula
 * @param {Number} lat1 - Latitude of first point in decimal degrees
 * @param {Number} lon1 - Longitude of first point in decimal degrees
 * @param {Number} lat2 - Latitude of second point in decimal degrees
 * @param {Number} lon2 - Longitude of second point in decimal degrees
 * @returns {Number} Distance in yards
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Convert to radians
    const toRad = (value) => (value * Math.PI) / 180;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distanceInMeters = R * c;
    const distanceInYards = distanceInMeters * 1.0936; // Convert meters to yards
    
    return parseFloat(distanceInYards.toFixed(1));
  };
  
  /**
   * Calculate the bearing between two points
   * @param {Number} lat1 - Latitude of first point in decimal degrees
   * @param {Number} lon1 - Longitude of first point in decimal degrees
   * @param {Number} lat2 - Latitude of second point in decimal degrees
   * @param {Number} lon2 - Longitude of second point in decimal degrees
   * @returns {Number} Bearing in degrees (0-360)
   */
  exports.calculateBearing = (lat1, lon1, lat2, lon2) => {
    // Convert to radians
    const toRad = (value) => (value * Math.PI) / 180;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const λ1 = toRad(lon1);
    const λ2 = toRad(lon2);
    
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normalize to 0-360
    
    return parseFloat(bearing.toFixed(1));
  };
  
  /**
   * Determine shot direction based on bearing
   * @param {Number} bearing - Bearing in degrees (0-360)
   * @returns {String} Direction (Left, Right, Straight)
   */
  exports.determineDirection = (bearing) => {
    // Assuming the target is at 0 degrees (North)
    if (bearing > 345 || bearing < 15) {
      return 'Straight';
    } else if (bearing >= 15 && bearing <= 180) {
      return 'Right';
    } else {
      return 'Left';
    }
  };
  
  /**
   * Check if a point is within a certain distance of another point
   * @param {Number} lat1 - Latitude of first point in decimal degrees
   * @param {Number} lon1 - Longitude of first point in decimal degrees
   * @param {Number} lat2 - Latitude of second point in decimal degrees
   * @param {Number} lon2 - Longitude of second point in decimal degrees
   * @param {Number} distance - Distance threshold in yards
   * @returns {Boolean} True if within distance threshold
   */
  exports.isWithinDistance = (lat1, lon1, lat2, lon2, distance) => {
    const calculatedDistance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return calculatedDistance <= distance;
  };