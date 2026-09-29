import multer from 'multer'
import { logSafeError } from '../services/safeErrorLog.js'

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'That PDF is too large. Please choose a file smaller than 8 MB.'
      : 'We could not accept that file. Please choose one PDF resume.'
    return response.status(400).json({ error: message })
  }

  const statusCode = error.statusCode || 500
  const message = statusCode >= 500
    ? 'Something went wrong on our side. Please try again in a moment.'
    : error.message

  if (statusCode >= 500) {
    logSafeError('http.request', error)
  }

  return response.status(statusCode).json({ error: message })
}
