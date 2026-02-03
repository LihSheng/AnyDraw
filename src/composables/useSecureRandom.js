/**
 * Cryptographically secure random number utilities
 * Uses Web Crypto API for provably fair randomness
 */

/**
 * Generate a cryptographically secure random number between 0 and 1
 * @returns {number} Random float between 0 (inclusive) and 1 (exclusive)
 */
export function secureRandom() {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] / (0xFFFFFFFF + 1)
}

/**
 * Generate a cryptographically secure random integer within a range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
export function secureRandomInt(min, max) {
  const range = max - min + 1
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return min + (array[0] % range)
}

/**
 * Fisher-Yates shuffle using cryptographically secure randomness
 * @param {Array} array - Array to shuffle (mutates in place)
 * @returns {Array} The shuffled array
 */
export function secureShuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
