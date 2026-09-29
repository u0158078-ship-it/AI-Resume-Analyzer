import assert from 'node:assert/strict'
import test from 'node:test'
import { PDFParse } from 'pdf-parse'
import { analysisSchema } from '../services/resumeAnalysis.js'

function createTextPdf(text) {
  const escapedText = text.replace(/[\\()]/g, '\\$&')
  const content = `BT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, 'binary'))
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(pdf, 'binary')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'binary')
}

test('pdf-parse extracts text from a PDF buffer', async () => {
  const parser = new PDFParse({ data: createTextPdf('Product designer with five years experience') })
  try {
    const result = await parser.getText()
    assert.match(result.text, /Product designer with five years experience/)
  } finally {
    await parser.destroy()
  }
})

test('analysis schema accepts valid scores and rejects out-of-range scores', () => {
  const validAnalysis = {
    overallScore: 84,
    summary: 'Good alignment with several clear opportunities to improve.',
    matchingSkills: ['Research'],
    missingSkills: ['Prototyping'],
    strengths: ['Relevant project work'],
    weaknesses: ['Limited impact measures'],
    recommendations: ['Add measurable outcomes to project descriptions.'],
    atsKeywords: ['Product design'],
    experienceAnalysis: 'Experience is relevant to the role.',
    educationAnalysis: 'Education is listed in the resume.',
  }

  assert.equal(analysisSchema.safeParse(validAnalysis).success, true)
  assert.equal(analysisSchema.safeParse({ ...validAnalysis, overallScore: 101 }).success, false)
})