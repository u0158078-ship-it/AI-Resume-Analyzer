import { Router } from 'express'
import multer from 'multer'
import { createAnalysis, getAnalysis, listAnalyses } from '../controllers/analysisController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireWorkspace } from '../middleware/requireWorkspace.js'
import { requireDatabase } from '../services/database.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(request, file, callback) {
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      const error = new Error('Only PDF files are supported. Please choose a PDF resume.')
      error.statusCode = 400
      return callback(error)
    }
    return callback(null, true)
  },
})

router.use(requireWorkspace, requireDatabase)
router.post('/analyze', upload.single('resume'), asyncHandler(createAnalysis))
router.get('/analyses', asyncHandler(listAnalyses))
router.get('/analyses/:id', asyncHandler(getAnalysis))

export default router
