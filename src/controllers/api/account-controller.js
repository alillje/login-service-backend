/**
 * Module for the AccountController.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../../models/user.js'
import { transporter } from '../../utils/mail-service.js'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      // Check all required fields exist before making request to DB.
      if (!req.body.username || !req.body.email || !req.body.password) {
        const error = new Error('Validation error')
        error.name = 'ValidationError'
        throw error
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      })

      await user.save()

      res.status(201).json({ id: user.id })
    } catch (err) {
      console.log(err)
      let error = err

      if (error.code === 11000) {
        // Duplicated keys.
        error = createError(409)
        error.cause = err
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        error = createError(400)
        error.cause = err
      }
      next(error)
    }
  }

  /**
   * Authenticates a user.
   * Sets user-id to subject in JWT payload & creates an access token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      if (!req.body.username || !req.body.password) {
        const error = createError(400)
        next(error)
      }
      const user = await User.authenticate(
        req.body.username.toLowerCase(),
        req.body.password
      )
      const payload = {
        sub: user.id
      }

      const accessToken = jwt.sign(
        payload,
        Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64').toString(
          'ascii'
        ),
        {
          algorithm: 'RS256',
          expiresIn: process.env.ACCESS_TOKEN_LIFE
        }
      )

      res.status(200).json({
        access_token: accessToken
      })
    } catch (err) {
      console.log(err.name)
      const error = createError(401)
      error.cause = err
      next(error)
    }
  }

  /**
   * Updates the password of a specific user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePassword (req, res, next) {
    try {
      if (!req.body.username || !req.body.password || !req.body.newPassword || !req.body.newPasswordConfirm) {
        const error = createError(400)
        next(error)
      } else if (req.body.newPassword !== req.body.newPasswordConfirm) {
        const error = createError(400)
        next(error)
      }

      const user = await User.authenticate(
        req.body.username.toLowerCase(),
        req.body.password
      )

      user.password = req.body.newPassword
      user.save()

      res
        .status(204)
        .end()
    } catch (err) {
      console.log(err)
      let error = err
      error = createError(400)
      next(error)
    }
  }

  /**
   * Restores a user password, by sending a restore email to user email.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async sendRestoreEmail (req, res, next) {
    try {
      if (!req.body.email) {
        const error = createError(400)
        next(error)
      }

      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        const error = createError(404)
        next(error)
        return
      }
      const payload = {
        sub: user.id
      }

      const restorePasswordToken = jwt.sign(
        payload,
        Buffer.from(process.env.PASSWORD_RESET_PRIVATE, 'base64').toString(
          'ascii'
        ),
        {
          algorithm: 'RS256',
          expiresIn: process.env.PASSWORD_RESET_TOKEN_LIFE
        }
      )

      await transporter.sendMail({
        from: `"Login Service" <${process.env.EMAIL_USER}>`, // sender address
        to: req.body.email, // list of receivers
        subject: 'Restore Password', // Subject line
        text: `This is your reset token: ${restorePasswordToken}`, // plain text body
        html: `This is your reset token: ${restorePasswordToken}` // html body
      })

      res.status(204).end()
    } catch (err) {
      console.log(err)
      const error = err
      next(error)
    }
  }

  /**
   * Reset a user password.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async resetPassword (req, res, next) {
    try {
      if (!req.body.newPassword) {
        const error = createError(400)
        next(error)
      }
      const user = await User.findById(req.user.sub)
      user.password = req.body.newPassword
      user.save()
      res
        .status(204)
        .end()
    } catch (err) {
      console.log(err)
      let error = err
      error = createError(400)
      next(error)
    }
  }

  /**
   * Provide req.user to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the user to load.
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
}
