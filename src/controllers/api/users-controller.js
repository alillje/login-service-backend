/**
 * Module for the UsersController.
 *
 * @author Andreas Lillje
 * @version 2.3.1
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
      // Get the image.
      const user = await User.findById(id)

      // If no user found send 404, set error message.
      if (!user) {
        const error = createError(404)
        next(error)
        return
      }

      // Provide the user to the request object.
      req.user = user

      // Next middleware.
      next()
    } catch (err) {
      let error = err
      // If id is incorrect, does not match mongoose format (CastError), send 404
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
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getAll (req, res, next) {
    const query = {}
    // Pagination
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const results = {}

    try {
      // Check length of all users
      const allUsers = await User.find(query)

      results.users = await User.find(query).limit(limit).skip(startIndex).sort({ company: 1 })
      // Pagination
      if (endIndex < allUsers.length) {
        results.next = {
          page: page + 1,
          limit
        }
      }
      if (startIndex < 0) {
        results.previous = {
          page: page - 1,
          limit
        }
      }

      results.pages = Math.ceil(allUsers.length / limit)

      res.json(results)
    } catch (error) {
      console.error(error)
      next(error)
    }
  }

  // /**
  //  * Registers a user.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  * @param {Function} next - Express next middleware function.
  //  */
  // async updatePassword (req, res, next) {
  //   try {
  //     if (!req.body.customer || !req.body.newPassword || !req.body.newPasswordConfirm) {
  //       const error = createError(400)
  //       next(error)
  //     } else if (req.body.newPassword !== req.body.newPasswordConfirm) {
  //       const error = createError(400)
  //       next(error)
  //     }

  //     const customer = await User.findById(req.body.customer)
  //     if (!customer) {
  //       const error = createError(404)
  //       next(error)
  //     }

  //     customer.password = req.body.newPassword
  //     customer.save()

  //     res
  //       .status(204)
  //       .end()
  //   } catch (err) {
  //     console.log(err)
  //     let error = err
  //     error = createError(400)
  //     next(error)
  //   }
  // }
}
