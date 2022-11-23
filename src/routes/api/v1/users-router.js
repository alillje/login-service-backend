/**
 * Users routes.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { UsersController } from '../../../controllers/api/users-controller.js'

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
const authorizeJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    // Set properties to req.user from JWT payload
    const payload = jwt.verify(token, Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY, 'base64').toString('ascii'))

    req.user = {
      sub: payload.sub
    }

    next()
  } catch (err) {
    const error = createError(403)
    error.cause = err
    next(error)
  }
}

export const router = express.Router()

const controller = new UsersController()

router.param('id', (req, res, next, id) => controller.loadUser(req, res, next, id))

router.get('/', authorizeJWT, (req, res, next) => controller.getUsers(req, res, next))

router.delete('/:id',
  authorizeJWT,
  (req, res, next) => controller.deleteUser(req, res, next)
)
