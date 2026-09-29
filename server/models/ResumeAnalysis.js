import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    atsKeywords: [{ type: String }],
    experienceAnalysis: { type: String, required: true },
    educationAnalysis: { type: String, required: true },
  },
  { _id: false },
)

const resumeAnalysisSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true, match: /^[a-f\d-]{36}$/i },
    filename: { type: String, required: true, maxlength: 255 },
    targetJobRole: { type: String, required: true, maxlength: 100 },
    analysis: { type: analysisSchema, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

resumeAnalysisSchema.index({ workspaceId: 1, createdAt: -1 })

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema)
