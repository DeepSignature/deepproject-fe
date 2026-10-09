import { Badge, Box, Text } from '@chakra-ui/react'
import type { TaskPriority, TaskResponse } from '../lib/types'

const priorityColor: Record<TaskPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null
  const date = new Date(dueDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function TaskCard({ task }: { task: TaskResponse }) {
  const dueDate = formatDueDate(task.dueDate)

  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
      bg="bg"
      p="3"
      _hover={{ borderColor: 'border.emphasized' }}
    >
      <Text fontSize="sm" fontWeight="medium">
        {task.title}
      </Text>

      <Box mt="2">
        <Badge colorPalette={priorityColor[task.priority]} variant="subtle" size="sm">
          {task.priority}
        </Badge>
      </Box>

      {dueDate && (
        <Text mt="2" fontSize="xs" color="fg.muted">
          Due {dueDate}
        </Text>
      )}
    </Box>
  )
}
