function redactSensitiveText(value, sensitiveValues = []) {
  let text = String(value ?? '')

  for (const sensitiveValue of sensitiveValues) {
    if (typeof sensitiveValue === 'string' && sensitiveValue.length > 0) {
      text = text.replaceAll(sensitiveValue, '[REDACTED]')
    }
  }

  return text
    .replace(/\bAIza[\w-]{30,}\b/g, '[REDACTED_API_KEY]')
    .replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]')
    .replace(/\bmongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, '[REDACTED_MONGODB_URI]')
    .replace(/((?:api[_ -]?key|authorization|password|passwd|secret)\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .slice(0, 1500)
}

export function logSafeError(context, error, { sensitiveValues = [] } = {}) {
  const providerError = error?.response?.data?.error ?? error?.error
  const details = {
    name: error?.name,
    message: redactSensitiveText(error?.message || error, sensitiveValues),
    status: error?.status ?? error?.statusCode,
    code: error?.code,
  }

  if (error?.response?.status !== undefined) {
    details.responseStatus = error.response.status
  }
  if (providerError && typeof providerError === 'object') {
    if (providerError.code !== undefined) details.providerCode = providerError.code
    if (providerError.status !== undefined) details.providerStatus = providerError.status
    if (providerError.message !== undefined) {
      details.providerMessage = redactSensitiveText(providerError.message, sensitiveValues)
    }
    if (Array.isArray(providerError.details)) {
      details.providerDetails = providerError.details.slice(0, 5).map((item) => ({
        reason: redactSensitiveText(item?.reason, sensitiveValues),
        domain: redactSensitiveText(item?.domain, sensitiveValues),
        message: redactSensitiveText(item?.message, sensitiveValues),
      }))
    }
  }

  console.error(`[${context}] ${JSON.stringify(details)}`)
}