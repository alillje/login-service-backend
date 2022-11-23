/**
 * Module for the UsersController.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import createError from 'http-errors'
import { User } from '../../models/user.js'

/**
 * Encapsulates a controller.
 */
export class UsersController {
  /**
   * Provide req.user to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the image to load.
   */
  async loadUser (req, res, next, id) {
    try {
      const user = await User.findById(id)

      if (!user) {
        const error = createError(404)
        next(error)
        return
      }
      // Provide the user to the request object.
      req.user = user
      next()
    } catch (err) {
      let error = err
      if (error.name === 'CastError') {
        error = createError(404)
        next(error)
      } else {
        next(error)
      }
    }
  }

  /**
   * Sends a JSON response containing a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    res.json(req.user)
  }

  /**
   * Gets all users.
   * Find and paginate results based on query parameters.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getUsers (req, res, next) {
    const query = {}
    // Pagination
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const results = {}

    try {
      // Check length of all users
      if (req.query.username) {
        query.username = {
          $regex: new RegExp(req.query.username, 'i')
        }
      }
      const allUsers = await User.find(query)
      results.users = await User.find(query).limit(limit).skip(startIndex).sort({ username: 1 })
      // Pagination
      if (endIndex < page) {
        results.next = {
          page,
          limit
        }
      }
      if (page > 1) {
        results.previous = {
          page,
          limit
        }
      }

      if (req.query.page) {
        results.pages = Math.ceil(allUsers.length / limit) || 1
      }
      res.json(results)
    } catch (error) {
      console.error(error)
      next(error)
    }
  }
}
