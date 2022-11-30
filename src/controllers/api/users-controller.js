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
   * Gets users.
   * Finds and paginate results based on query parameters.
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
      if (allUsers.length / limit > page) {
        results.next = {
          page: page + 1
        }
      }
      if (page > 1 && page <= allUsers.length / limit) {
        results.previous = {
          page: page - 1
        }
      }

      if (req.query.page) {
        results.pages = Math.ceil(allUsers.length / limit) || 1
      }
      res.json(results)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deleteUser (req, res, next) {
    try {
      if (req.user.sub !== req.params.id) {
        const error = createError(403)
        next(error)
        return
      }

      const user = User.findById(req.user.sub)
      user.remove().exec()

      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
