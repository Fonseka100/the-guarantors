/**
 * Calculates confidence score for address validation
 */

/**
 * Confidence score weights
 */
const CONFIDENCE_WEIGHTS = {
  GOOGLE_ACCURACY: 0.4,
  COMPONENT_COMPLETENESS_FULL: 0.4,
  COMPONENT_COMPLETENESS_PARTIAL: 0.3,
  EXACT_MATCH_BONUS: 0.2,
  PARTIAL_MATCH_REDUCED: 0.1,
};

/**
 * Calculates confidence score based on various factors
 * @param {Object} params
 * @param {boolean} params.hasAllComponents - Whether all address components are present
 * @param {number} params.googleAccuracy - Google's location_type accuracy (0-1)
 * @param {boolean} params.isExactMatch - Whether the address matches exactly
 * @param {number} params.componentMatchRatio - Ratio of matched components (0-1)
 * @returns {number} Confidence score between 0 and 1
 */
export function calculateConfidence({
  hasAllComponents,
  googleAccuracy,
  isExactMatch,
  componentMatchRatio,
}) {
  let score = 0;

  // Base score from Google's accuracy
  score += googleAccuracy * CONFIDENCE_WEIGHTS.GOOGLE_ACCURACY;

  // Component completeness
  if (hasAllComponents) {
    score += CONFIDENCE_WEIGHTS.COMPONENT_COMPLETENESS_FULL;
  } else {
    score += componentMatchRatio * CONFIDENCE_WEIGHTS.COMPONENT_COMPLETENESS_PARTIAL;
  }

  // Exact match bonus
  if (isExactMatch) {
    score += CONFIDENCE_WEIGHTS.EXACT_MATCH_BONUS;
  } else {
    // Partial match gets reduced score
    score += componentMatchRatio * CONFIDENCE_WEIGHTS.PARTIAL_MATCH_REDUCED;
  }

  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, score));
}

/**
 * Maps Google location_type to accuracy score
 * @param {string} locationType - Google location_type (ROOFTOP, RANGE_INTERPOLATED, etc.)
 * @returns {number} Accuracy score (0-1)
 */
export function mapGoogleLocationTypeToAccuracy(locationType) {
  const accuracyMap = {
    'ROOFTOP': 1.0,
    'RANGE_INTERPOLATED': 0.85,
    'GEOMETRIC_CENTER': 0.7,
    'APPROXIMATE': 0.5,
  };

  return accuracyMap[locationType] || 0.3;
}
