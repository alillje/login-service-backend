/**
 * Module for the MailService.
 * Sets up a transporter using 'nodemailer'.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */

import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
