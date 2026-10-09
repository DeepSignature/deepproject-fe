import keycloak, { updateToken } from './keycloak'
import type {
  CursorPageProjectResponse,
  CursorPageWorkspaceResponse,
  ProjectResponse,
  UserProfileResponse,
  WorkspaceResponse,
} from './types'

const BASE_URL = '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getAccessToken(): Promise<string> {
  if (!keycloak.authenticated) {
    throw new ApiError(401, 'Not authenticated')
  }
  try {
    await updateToken(30)
  } catch {
    throw new ApiError(401, 'Session expired')
  }
  if (!keycloak.token) {
    throw new ApiError(401, 'No access token')
  }
  return keycloak.token
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const token = await getAccessToken()
  headers.set('Authorization', `Bearer ${token}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (response.status === 401) {
    keycloak.clearToken()
  }

  if (!response.ok) {
    let message = response.statusText
    try {
      const text = await response.text()
      if (text) message = text
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}

export const api = {
  me: () => request<UserProfileResponse>('/users/me'),

  listWorkspaces: (userId: string) =>
    request<CursorPageWorkspaceResponse>(
      `/workspaces?userId=${encodeURIComponent(userId)}`,
    ),

  getWorkspace: (id: string) =>
    request<WorkspaceResponse>(`/workspaces/${encodeURIComponent(id)}`),

  listProjects: (workspaceId: string) =>
    request<CursorPageProjectResponse>(
      `/workspaces/${encodeURIComponent(workspaceId)}/projects`,
    ),

  getProject: (workspaceId: string, projectId: string) =>
    request<ProjectResponse>(
      `/workspaces/${encodeURIComponent(workspaceId)}/projects/${encodeURIComponent(projectId)}`,
    ),
}
