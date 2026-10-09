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

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'BLOCKED'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface TaskResponse {
  id: string
  projectId: string
  parentTaskId: string | null
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  taskType: string
  dueDate: string | null
  completedAt: string | null
}

export type CursorPageTaskResponse = CursorPage<TaskResponse>

export interface StatusCount {
  status: string
  count: number
}

export interface PriorityCount {
  priority: string
  count: number
}

export interface TypeCount {
  type: string
  count: number
}

export interface ProjectDashboardResponse {
  totalTaskCount: number
  overdueTaskCount: number
  completedTaskCount: number
  completionPercentage: number
  tasksByStatus: StatusCount[]
  tasksByPriority: PriorityCount[]
  tasks: CursorPageTaskResponse
}

export interface AssigneeDashboardResponse {
  assigneeId: string
  displayName: string
  totalTaskCount: number
  overdueTaskCount: number
  completedTaskCount: number
  completionPercentage: number
  tasksByStatus: StatusCount[]
  tasksByPriority: PriorityCount[]
  tasks: CursorPageTaskResponse
}

export interface TaskPeriodStatistics {
  createdTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number
  avgCycleTimeSeconds: number
  estimatedHours: number
  actualHours: number
  byStatus: StatusCount[]
  byPriority: PriorityCount[]
  byType: TypeCount[]
}

export interface ProjectStatisticsResponse {
  projectId: string
  from: string
  to: string
  previousFrom: string
  previousTo: string
  current: TaskPeriodStatistics
  previous: TaskPeriodStatistics
}

export interface ProjectAttentionResponse {
  projectId: string
  overdueTasks: TaskResponse[]
  highPriorityTasks: TaskResponse[]
  staleTasks: TaskResponse[]
}

export interface UserResponse {
  id: string
  identityId: string
  username: string
  email: string
  displayName: string
  active: boolean
}

export type CursorPageUserResponse = CursorPage<UserResponse>
