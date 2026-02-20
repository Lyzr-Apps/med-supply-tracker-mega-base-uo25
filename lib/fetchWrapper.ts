const fetchWrapper = async (...args: Parameters<typeof fetch>): Promise<Response> => {
  try {
    const response = await fetch(...args)

    if (response.redirected) {
      if (typeof window !== 'undefined') {
        window.location.href = response.url
      }
      throw new Error('Request redirected to authentication flow.')
    }

    if (response.status === 404) {
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/html')) {
        const html = await response.text()

        if (typeof document !== 'undefined') {
          document.open()
          document.write(html)
          document.close()
        }

        throw new Error('Backend returned an HTML fallback page.')
      }

      throw new Error('Backend endpoint not found (404).')
    }

    if (response.status >= 500) {
      throw new Error(`Backend is unavailable (${response.status}).`)
    }

    return response
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Cannot connect to backend.')
  }
}

export default fetchWrapper
