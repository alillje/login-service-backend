/**
 * Account routes.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { AccountController } from '../../../controllers/api/account-controller.js'

export const router = express.Router()

const controller = new AccountController()

/**
 * Authenticates requests.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    const payload = jwt.verify(token, Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY, 'base64').toString('ascii'))
    req.user = {
      sub: payload.sub,
      user: payload.user
    }

    next()
  } catch (err) {
    const error = createError(401)
    err.message = 'Invalid access token'
    error.cause = err
    next(error)
  }
}

/**
 * Authorizes users.
 *
 * Checks if user has right/access to access the specific user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authorizeUser = (req, res, next) => {
  try {
    if (req.user.sub !== req.params.id) {
      throw new Error('No right to access.')
    }

    next()
  } catch (err) {
    const error = createError(403)
    error.cause = err
    next(error)
  }
}

/**
 * Authenticates reset of passwords.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticatePasswordResetJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    // Set properties to req.user from JWT payload
    const payload = jwt.verify(token, Buffer.from(process.env.process.env.PASSWORD_RESET_PUBLIC, 'base64').toString('ascii'))
    req.user = {
      sub: payload.sub
    }
    next()
  } catch (err) {
    const error = createError(401)
    err.message = 'Invalid access token'
    error.cause = err
    next(error)
  }
}

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadUser(req, res, next, id))

// Register
router.post('/register', (req, res, next) => controller.register(req, res, next))

// Log in
router.post('/login', (req, res, next) => controller.login(req, res, next))

// Update password
router.patch('/password/update', authenticateJWT, (req, res, next) => controller.updatePassword(req, res, next))

// Restore password
router.post('/password/restore', (req, res, next) => controller.sendRestoreEmail(req, res, next))

// Reset password
router.patch('/password/reset', authenticatePasswordResetJWT, (req, res, next) => controller.resetPassword(req, res, next))

// GET user/:id
router.get('/user/:id',
  authenticateJWT, authorizeUser,
  (req, res, next) => controller.find(req, res, next)
)

// PATCH password/:id
router.patch('/password/:id',
  authenticateJWT, authorizeUser,
  (req, res, next) => controller.updatePassword(req, res, next)
)
