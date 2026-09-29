import mongoose from 'mongoose'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import { analyzeResume } from '../services/resumeAnalysis.js'
import { logSafeError } from '../services/safeErrorLog.js'

const requestSchema = z.object({
  targetJobRole: z.string().trim().min(2, 'Enter a target job role.').max(100, 'Keep the job role under 100 characters.'),
})

function requestError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export async function createAnalysis(request, response) {
  const requestValidation = requestSchema.safeParse(request.body)
  if (!requestValidation.success) {
    throw requestError(requestValidation.error.issues[0]?.message || 'Enter a target job role.')
  }
  if (!request.file) {
    throw requestError('Choose a PDF resume before starting the analysis.')
  }

  const { buffer, originalname } = request.file
  if (buffer.length === 0) {
    throw requestError('That PDF is empty. Please choose a different resume.')
  }
  if (buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw requestError('This file does not appear to be a valid PDF. Please choose a PDF resume.')
  }

  let extractedText
  let parser
  try {
    parser = new PDFParse({ data: buffer })
    const parsedPdf = await parser.getText()
    extractedText = parsedPdf.text.replace(/\s+/g, ' ').trim()
  } catch (error) {
    logSafeError('analysis.pdf-parse', error)
    throw requestError('We could not read this PDF. Try exporting it again as a text-based PDF.', 422)
  } finally {
    await parser?.destroy()
  }

  if (extractedText.length < 40) {
    throw requestError('We could not find readable text in this PDF. Scanned image-only resumes are not supported yet.', 422)
  }

  const analysis = await analyzeResume(extractedText.slice(0, 30000), requestValidation.data.targetJobRole)
  let savedAnalysis
  try {
    savedAnalysis = await ResumeAnalysis.create({
      workspaceId: request.workspaceId,
      filename: originalname.slice(0, 255),
      targetJobRole: requestValidation.data.targetJobRole,
      analysis,
      score: analysis.overallScore,
    })
  } catch (error) {
    logSafeError('analysis.mongodb-save', error)
    throw requestError('The analysis finished, but we could not save it. Check your MongoDB connection and try again.', 503)
  }

  return response.status(201).json({
    id: savedAnalysis.id,
    filename: savedAnalysis.filename,
    targetJobRole: savedAnalysis.targetJobRole,
    createdAt: savedAnalysis.createdAt,
    analysis: savedAnalysis.analysis,
  })
}

export async function listAnalyses(request, response) {
  const analyses = await ResumeAnalysis.find({ workspaceId: request.workspaceId })
    .select('filename targetJobRole score createdAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return response.json({ analyses })
}

export async function getAnalysis(request, response) {
  if (!/^[a-f\d]{24}$/i.test(request.params.id) || !mongoose.isValidObjectId(request.params.id)) {
    throw requestError('That analysis link is invalid.', 400)
  }

  const analysis = await ResumeAnalysis.findOne({ _id: request.params.id, workspaceId: request.workspaceId }).lean()
  if (!analysis) {
    throw requestError('We could not find that analysis. It may have been removed.', 404)
  }

  return response.json({ analysis })
}
