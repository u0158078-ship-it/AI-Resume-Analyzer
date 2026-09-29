import dns from 'node:dns'
import mongoose from 'mongoose'

const reconnectDelayMs = 1000
let connectionString
let reconnectTimer
let connectionAttempt

function scheduleReconnect() {
  if (!connectionString || reconnectTimer) return

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined
    if (mongoose.connection.readyState === 1) return

    const connected = await establishConnection()
    if (!connected) scheduleReconnect()
  }, reconnectDelayMs)
  reconnectTimer.unref()
}

mongoose.connection.on('disconnected', scheduleReconnect)
mongoose.connection.on('connected', () => {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = undefined
})

async function establishConnection() {
  if (mongoose.connection.readyState === 1) return true
  if (connectionAttempt) return connectionAttempt

  connectionAttempt = (async () => {
    try {
      await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 7000 })
      console.log('Connected to MongoDB Atlas.')
      return true
    } catch (error) {
      if (error.code === 'EBADRESP' && error.syscall === 'querySrv') {
        try {
          dns.setServers(['1.1.1.1', '1.0.0.1'])
          await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 7000 })
          console.log('Connected to MongoDB Atlas.')
          return true
        } catch (retryError) {
          console.error(`MongoDB connection failed: ${retryError.message}`)
          return false
        }
      }

      console.error(`MongoDB connection failed: ${error.message}`)
      return false
    }
  })()

  try {
    return await connectionAttempt
  } finally {
    connectionAttempt = undefined
  }
}

export async function connectDatabase() {
  connectionString = process.env.MONGODB_URI

  if (!connectionString) {
    console.warn('MONGODB_URI is not set. Database-backed routes will be unavailable.')
    return false
  }

  const connected = await establishConnection()
  if (!connected) scheduleReconnect()
  return connected
}

export function requireDatabase(request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      error: 'The database is not connected yet. Check MONGODB_URI and try again.',
    })
  }

  return next()
}
