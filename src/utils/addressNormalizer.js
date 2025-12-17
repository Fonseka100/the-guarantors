/**
 * Normalizes address components to standard format
 */

/**
 * Normalizes street name (capitalizes words, handles abbreviations)
 * @param {string} street - Street name
 * @returns {string} Normalized street name
 */
export function normalizeStreet(street) {
  if (!street) return '';
  
  // Common street type abbreviations
  const streetTypes = {
    'st': 'St',
    'street': 'St',
    'ave': 'Ave',
    'avenue': 'Ave',
    'rd': 'Rd',
    'road': 'Rd',
    'blvd': 'Blvd',
    'boulevard': 'Blvd',
    'dr': 'Dr',
    'drive': 'Dr',
    'ln': 'Ln',
    'lane': 'Ln',
    'ct': 'Ct',
    'court': 'Ct',
    'pkwy': 'Pkwy',
    'parkway': 'Pkwy',
    'pl': 'Pl',
    'place': 'Pl',
    'cir': 'Cir',
    'circle': 'Cir',
  };

  // Split by spaces and normalize each word
  const words = street.toLowerCase().trim().split(/\s+/);
  const normalized = words.map((word, index) => {
    // Last word might be a street type
    if (index === words.length - 1 && streetTypes[word]) {
      return streetTypes[word];
    }
    // Capitalize first letter of each word
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return normalized.join(' ');
}

/**
 * Normalizes city name (title case)
 * @param {string} city - City name
 * @returns {string} Normalized city name
 */
export function normalizeCity(city) {
  if (!city) return '';
  
  // Handle special cases like "New York", "Los Angeles"
  const specialCases = {
    'new york': 'New York',
    'los angeles': 'Los Angeles',
    'san francisco': 'San Francisco',
    'san diego': 'San Diego',
    'las vegas': 'Las Vegas',
  };

  const lower = city.toLowerCase().trim();
  if (specialCases[lower]) {
    return specialCases[lower];
  }

  // Title case
  return city
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalizes state to 2-letter abbreviation
 * @param {string} state - State name or abbreviation
 * @returns {string} 2-letter state abbreviation
 */
export function normalizeState(state) {
  if (!state) return '';
  
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC',
  };

  const normalized = state.trim().toLowerCase();
  
  // If already 2 letters and uppercase, return as is
  if (normalized.length === 2 && /^[a-z]{2}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  
  // Map full name to abbreviation
  return stateMap[normalized] || state.toUpperCase();
}

/**
 * Normalizes ZIP code (5 digits or 5+4 format)
 * @param {string} zipCode - ZIP code
 * @returns {string} Normalized ZIP code
 */
export function normalizeZipCode(zipCode) {
  if (!zipCode) return '';
  
  // Remove non-digits
  const digits = zipCode.replace(/\D/g, '');
  
  // Return first 5 digits (or all if less than 5)
  return digits.substring(0, 5);
}

/**
 * Normalizes street number
 * @param {string} number - Street number
 * @returns {string} Normalized street number
 */
export function normalizeNumber(number) {
  if (!number) return '';
  return number.trim();
}
