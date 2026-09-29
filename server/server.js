import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { errorHandler } from './middleware/errorHandler.js'
import analysisRoutes from './routes/analysisRoutes.js'
import { connectDatabase } from './services/database.js'

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (request, response) => {
	response.json({ status: 'ok' })
})

app.get('/api/ready', (request, response) => {
	const databaseConnected = mongoose.connection.readyState === 1
	const geminiConfigured = Boolean(process.env.GEMINI_API_KEY)
	const ready = databaseConnected && geminiConfigured

	response.status(ready ? 200 : 503).json({
		status: ready ? 'ready' : 'not_ready',
		services: {
			database: databaseConnected ? 'connected' : 'disconnected',
			gemini: geminiConfigured ? 'configured' : 'missing',
		},
	})
})

app.use('/api', analysisRoutes)
app.use(errorHandler)

await connectDatabase()

app.listen(PORT, () => {
	console.log(`Resume Analyzer API listening on port ${PORT}.`)
})
