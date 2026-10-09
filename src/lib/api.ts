import keycloak, { updateToken } from './keycloak'
import type {
  AssigneeDashboardResponse,
  CursorPageProjectResponse,
  CursorPageUserResponse,
  CursorPageWorkspaceResponse,
  ProjectAttentionResponse,
  ProjectDashboardResponse,
  ProjectResponse,
  ProjectStatisticsResponse,
  TaskPriority,
  TaskStatus,
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

  listUsers: () => request<CursorPageUserResponse>('/users?limit=100'),

  dashboard: (
    projectId: string,
    params: {
      from?: string
      to?: string
      taskLimit?: number
      taskCursor?: string
      status?: TaskStatus[]
      priority?: TaskPriority[]
    } = {},
  ) => {
    const query = new URLSearchParams()
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    if (params.taskLimit) query.set('taskLimit', String(params.taskLimit))
    if (params.taskCursor) query.set('taskCursor', params.taskCursor)
    params.status?.forEach((s) => query.append('status', s))
    params.priority?.forEach((p) => query.append('priority', p))
    const qs = query.toString()
    return request<ProjectDashboardResponse>(
      `/projects/${encodeURIComponent(projectId)}/dashboard${qs ? `?${qs}` : ''}`,
    )
  },

  dashboardStatistics: (projectId: string, from: string, to: string) =>
    request<ProjectStatisticsResponse>(
      `/projects/${encodeURIComponent(projectId)}/dashboard/statistics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  dashboardAttention: (projectId: string, limit = 20) =>
    request<ProjectAttentionResponse>(
      `/projects/${encodeURIComponent(projectId)}/dashboard/attention?limit=${limit}`,
    ),

  assigneeDashboard: (
    projectId: string,
    assigneeId: string,
    params: {
      from?: string
      to?: string
      limit?: number
      cursor?: string
    } = {},
  ) => {
    const query = new URLSearchParams()
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    if (params.limit) query.set('limit', String(params.limit))
    if (params.cursor) query.set('cursor', params.cursor)
    const qs = query.toString()
    return request<AssigneeDashboardResponse>(
      `/projects/${encodeURIComponent(projectId)}/dashboard/assignee/${encodeURIComponent(assigneeId)}/task${qs ? `?${qs}` : ''}`,
    )
  },
}
