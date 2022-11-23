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
    const payload = jwt.verify(token, Buffer.from(process.env.PASSWORD_RESET_PUBLIC, 'base64').toString('ascii'))
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

router.post('/register', (req, res, next) => controller.register(req, res, next))

router.post('/login', (req, res, next) => controller.login(req, res, next))

router.post('/password/restore', (req, res, next) => controller.sendRestoreEmail(req, res, next))

router.patch('/password/reset', authenticatePasswordResetJWT, (req, res, next) => controller.resetPassword(req, res, next))
