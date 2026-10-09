import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  NativeSelect,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import AttentionButton from '../components/AttentionButton'
import KanbanBoard from '../components/KanbanBoard'
import StatisticsBar from '../components/StatisticsBar'
import { api } from '../lib/api'
import type {
  ProjectAttentionResponse,
  ProjectStatisticsResponse,
  TaskPriority,
  TaskResponse,
  UserResponse,
} from '../lib/types'

const PRIORITIES: { value: TaskPriority | ''; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

function statisticsWindow(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { from: from.toISOString(), to: to.toISOString() }
}

export default function DashboardPage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>()
  const projectId = projectIdParam ?? ''

  const [users, setUsers] = useState<UserResponse[] | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')

  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [statistics, setStatistics] =
    useState<ProjectStatisticsResponse | null>(null)
  const [attention, setAttention] =
    useState<ProjectAttentionResponse | null>(null)
  const [attentionLoading, setAttentionLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    async function load() {
      try {
        const page = await api.listUsers()
        if (cancelled) return
        setUsers(page.items)
      } catch {
        if (cancelled) return
        setUsers([])
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    const { from, to } = statisticsWindow()
    async function load() {
      try {
        const data = await api.dashboardStatistics(projectId, from, to)
        if (!cancelled) setStatistics(data)
      } catch {
        if (!cancelled) setStatistics(null)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    async function load() {
      try {
        const data = await api.dashboardAttention(projectId)
        if (!cancelled) setAttention(data)
      } catch {
        if (!cancelled) setAttention(null)
      } finally {
        if (!cancelled) setAttentionLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    async function load() {
      setTasksLoading(true)
      try {
        let items: TaskResponse[]
        if (selectedAssigneeId) {
          const data = await api.assigneeDashboard(projectId, selectedAssigneeId, {
            limit: 100,
          })
          items = data.tasks.items
        } else {
          const data = await api.dashboard(projectId, {
            taskLimit: 100,
            priority: priority ? [priority] : undefined,
          })
          items = data.tasks.items
        }
        if (priority && selectedAssigneeId) {
          items = items.filter((task) => task.priority === priority)
        }
        if (!cancelled) setTasks(items)
      } catch {
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setTasksLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [projectId, selectedAssigneeId, priority])

  const selectOptions = useMemo(() => {
    return [
      { value: '', label: 'All assignees' },
      ...(users ?? []).map((user) => ({
        value: user.id,
        label: user.displayName || user.username || user.email,
      })),
    ]
  }, [users])

  if (!projectId) return null

  return (
    <Flex direction="column" flex="1" minH="0">
      <Box borderBottomWidth="1px" borderColor="border" px="6" py="4">
        <Flex align="center" justify="space-between" gap="4" flexWrap="wrap">
          <Box>
            <Heading size="md">Project Dashboard</Heading>
            <Text color="fg.muted" fontSize="xs">
              {projectId}
            </Text>
          </Box>

          <Flex align="center" gap="2">
            <NativeSelect.Root size="sm" variant="outline" maxW="220px">
              <NativeSelect.Field
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
              >
                {selectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <NativeSelect.Root size="sm" variant="outline" maxW="180px">
              <NativeSelect.Field
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
              >
                {PRIORITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Flex>
        </Flex>
      </Box>

      <StatisticsBar data={statistics} />

      <Flex flex="1" minH="0">
        {tasksLoading ? (
          <Flex align="center" justify="center" flex="1" gap="2">
            <Spinner size="sm" />
            <Text color="fg.muted" fontSize="sm">
              Loading tasks…
            </Text>
          </Flex>
        ) : (
          <KanbanBoard tasks={tasks} loading={tasksLoading} />
        )}
      </Flex>

      <AttentionButton data={attention} loading={attentionLoading} />
    </Flex>
  )
}
