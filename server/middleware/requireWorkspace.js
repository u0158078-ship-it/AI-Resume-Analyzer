const workspaceIdPattern = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i

export function requireWorkspace(request, response, next) {
  const workspaceId = request.get('X-Workspace-ID')
  if (!workspaceIdPattern.test(workspaceId || '')) {
    return response.status(400).json({
      error: 'Your browser workspace could not be identified. Refresh the page and try again.',
    })
  }

  request.workspaceId = workspaceId
  return next()
}