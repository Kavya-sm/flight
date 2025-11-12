/** Class representing Loyalty data model */
export default class Loyalty {
  /**
   * Creates an instance of Loyalty.
   * @param {Object} loyaltyData
   * @param {string} loyaltyData.level - Loyalty Tier Level
   * @param {number} loyaltyData.points - Sum of Loyalty points accumulated
   * @param {number} loyaltyData.remainingPoints - Remaining points to reach next tier
   * @param {number} loyaltyData.percentage - Progress percentage to next tier
   */
  constructor({ level, points, remainingPoints, percentage, userId, createdAt, updatedAt }) {
    this.level = level || 'bronze';
    this.points = points || 0;
    this.remainingPoints = remainingPoints || 1000;
    this.percentage = percentage || this.calculatePercentage();
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calculate progress percentage to next tier
   */
  calculatePercentage() {
    if (this.points === 0 || this.remainingPoints === 0) return 0;
    
    const totalPointsForNextTier = this.points + this.remainingPoints;
    return Math.ceil((this.points / totalPointsForNextTier) * 100);
  }

  /**
   * Get formatted level name (e.g., "Bronze" instead of "bronze")
   */
  getFormattedLevel() {
    return this.level.charAt(0).toUpperCase() + this.level.slice(1);
  }

  /**
   * Check if user has reached maximum tier
   */
  isMaxTier() {
    return this.level === 'platinum' && this.remainingPoints === 0;
  }
}
