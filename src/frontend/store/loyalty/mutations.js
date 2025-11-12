/**
 * SET_LOYALTY mutation - updates loyalty state
 */
export const SET_LOYALTY = (state, loyalty) => {
  // Ensure all required properties exist with defaults
  state.loyalty = {
    points: loyalty.points || 0,
    level: loyalty.level || 'bronze',
    remainingPoints: loyalty.remainingPoints || 1000,
    percentage: loyalty.percentage || 0,
    userId: loyalty.userId,
    createdAt: loyalty.createdAt,
    updatedAt: loyalty.updatedAt
  };
};

/**
 * RESET_LOYALTY mutation - clears loyalty state
 */
export const RESET_LOYALTY = (state) => {
  state.loyalty = {
    points: 0,
    level: 'bronze',
    remainingPoints: 1000,
    percentage: 0
  };
};
