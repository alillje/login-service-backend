import { ForbiddenCharacters } from './enum/forbidden-chars.js'
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
export const isValidUsername = (input) => {
  for (const char of Object.values(ForbiddenCharacters)) {
    if (input.includes(char)) {
      return false
    }
  }
  return true
}

/**
 * Validates if a password is of correct length.
 *
 * @param {string} password - The password to validate
 * @returns {boolean} - True if input is valid, false otherwise.
 */
export const isValidPassword = (password) => {
  return password.length >= 10 && password.length < 256
}
