const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')
const workspaceStorageKey = 'clearpath.workspaceId'

function getWorkspaceId() {
  let workspaceId = localStorage.getItem(workspaceStorageKey)
  if (!workspaceId) {
    workspaceId = crypto.randomUUID()
    localStorage.setItem(workspaceStorageKey, workspaceId)
  }
  return workspaceId
}

async function request(path, options) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...options,
      headers: { ...options?.headers, 'X-Workspace-ID': getWorkspaceId() },
    })
  } catch {
    throw new Error('Could not reach the server. Check that the backend is running and try again.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || 'The request could not be completed. Please try again.')
  }
  return body
}

export async function analyzeResume(file, targetJobRole) {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('targetJobRole', targetJobRole)
  return request('/analyze', { method: 'POST', body: formData })
}

export async function getAnalyses() {
  const response = await request('/analyses')
  return response.analyses
}

export async function getAnalysis(id) {
  const response = await request(`/analyses/${encodeURIComponent(id)}`)
  const saved = response.analysis
  return {
    id: saved._id,
    filename: saved.filename,
    targetJobRole: saved.targetJobRole,
    createdAt: saved.createdAt,
    analysis: saved.analysis,
  }
}