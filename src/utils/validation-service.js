
/**
 * Module for Validating input.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

/**
 * Validates if input contains any forbidden characters.
 *
 * @param {string} input - The string to validate
 * @returns {boolean} - True if input is valid, false otherwise.
 */
export const isValidInput = (input) => {
  const forbiddenChars = ['<', '>', '/']
  for (const char of forbiddenChars) {
    if (input.includes(char)) {
      return false
    }
  }
  return true
}
