import { Flex, Text } from '@chakra-ui/react'
import type { TaskResponse, TaskStatus } from '../lib/types'
import TaskCard from './TaskCard'

const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
  { key: 'BLOCKED', label: 'Blocked' },
]

interface KanbanBoardProps {
  tasks: TaskResponse[]
  loading: boolean
}

export default function KanbanBoard({
  tasks,
  loading,
}: KanbanBoardProps) {
  const grouped = STATUSES.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => task.status === column.key),
  }))

  return (
    <Flex gap="4" flex="1" minH="0" overflowX="auto" p="4">
      {grouped.map((column) => (
        <Flex
          key={column.key}
          direction="column"
          w="280px"
          minW="280px"
          flexShrink={0}
          bg="bg.muted"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          maxH="full"
        >
          <Flex
            align="center"
            justify="space-between"
            px="3"
            py="2"
            borderBottomWidth="1px"
            borderColor="border"
          >
            <Text fontSize="sm" fontWeight="semibold">
              {column.label}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {column.tasks.length}
            </Text>
          </Flex>

          <Flex direction="column" gap="2" p="2" overflowY="auto" flex="1">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {!loading && column.tasks.length === 0 && (
              <Text px="2" py="3" fontSize="xs" color="fg.muted">
                No tasks.
              </Text>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
