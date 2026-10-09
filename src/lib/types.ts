export interface UserProfileResponse {
  identityId: string
  userId: string
  username: string
  email: string
  displayName: string
  globalRoles: string[]
  globalPermissions: string[]
}

export interface WorkspaceResponse {
  id: string
  name: string
  slug: string
  description: string
  ownerId: string
  organizationId: string
}

export interface ProjectResponse {
  id: string
  workspaceId: string
  name: string
  description: string
  status: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export type CursorPageWorkspaceResponse = CursorPage<WorkspaceResponse>
export type CursorPageProjectResponse = CursorPage<ProjectResponse>
