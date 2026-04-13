import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const backendBaseURL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api'

const ensureApiBaseURL = (baseURL: string) => {
  const parsed = new URL(baseURL)
  let pathname = parsed.pathname.replace(/\/+$/, '')

  if (!pathname.endsWith('/api')) {
    pathname = `${pathname}/api`.replace(/\/+/g, '/')
  }

  parsed.pathname = `${pathname}/`
  return parsed.toString()
}

async function proxyToBackend(request: NextRequest, method: 'GET' | 'POST') {
  const url = new URL(request.url)
  const backendURL = new URL('events', ensureApiBaseURL(backendBaseURL))
  backendURL.search = url.search

  const headers: HeadersInit = {}
  const authorization = request.headers.get('authorization')
  const cookie = request.headers.get('cookie')
  const contentType = request.headers.get('content-type')

  if (authorization) {
    headers.authorization = authorization
  }

  if (cookie) {
    headers.cookie = cookie
  }

  if (contentType) {
    headers['content-type'] = contentType
  }

  const init: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  }

  if (method === 'POST') {
    init.body = await request.text()
  }

  const response = await fetch(backendURL, init)
  const body = await response.text()
  const responseHeaders = new Headers()
  const responseContentType = response.headers.get('content-type')

  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType)
  }

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest) {
  try {
    return await proxyToBackend(request, 'GET')
  } catch (error) {
    console.error('[events API] GET proxy failed:', error)
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 502 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await proxyToBackend(request, 'POST')
  } catch (error) {
    console.error('[events API] POST proxy failed:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 502 },
    )
  }
}