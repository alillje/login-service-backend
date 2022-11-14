/**
 * Mongoose model User.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

// Create a schema.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true
  },
  password: {
    type: String,
    minLength: [10, 'The password must be of minimum length 10 characters.'],
    maxLength: [256, 'The password must be of maximum length 256 characters.'],
    writeOnly: true,
    required: [true, 'Password is required.']
  }
}, {
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
      delete ret.password
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Salts and hashes password before save.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10)
})

/**
 * Authenticates a user.
 *
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {Promise<User>} ...
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  // If no user found or password is wrong, throw an error.
  if (!(await bcrypt.compare(password, user?.password))) {
    throw new Error('Invalid credentials.')
  }

  // User found and password correct, return the user.
  return user
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
