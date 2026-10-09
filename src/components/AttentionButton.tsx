import { useEffect, useRef, useState } from 'react'
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'
import type {
  ProjectAttentionResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus,
} from '../lib/types'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

interface AttentionItem {
  task: TaskResponse
  reason: string
}

function flattenAttention(data: ProjectAttentionResponse): AttentionItem[] {
  return [
    ...data.overdueTasks.map((task) => ({ task, reason: 'Overdue' })),
    ...data.highPriorityTasks.map((task) => ({
      task,
      reason: 'High priority',
    })),
    ...data.staleTasks.map((task) => ({ task, reason: 'Stale' })),
  ]
}

export default function AttentionButton({
  data,
  loading,
}: {
  data: ProjectAttentionResponse | null
  loading: boolean
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const items = data ? flattenAttention(data) : []
  const count = items.length

  return (
    <Box ref={containerRef} position="fixed" bottom="6" right="6" zIndex="10">
      {open && (
        <Box
          position="absolute"
          bottom="calc(100% + 12px)"
          right="0"
          w="360px"
          maxH="420px"
          overflowY="auto"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg"
          boxShadow="lg"
        >
          <Flex
            align="center"
            justify="space-between"
            px="4"
            py="3"
            borderBottomWidth="1px"
            borderColor="border"
          >
            <Text fontSize="sm" fontWeight="semibold">
              Needs attention
            </Text>
            <Button
              size="xs"
              variant="ghost"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <FiX />
            </Button>
          </Flex>

          {loading ? (
            <Text px="4" py="4" fontSize="sm" color="fg.muted">
              Loading…
            </Text>
          ) : items.length === 0 ? (
            <Text px="4" py="4" fontSize="sm" color="fg.muted">
              Nothing needs attention.
            </Text>
          ) : (
            items.map(({ task, reason }) => (
              <Box
                key={`${task.id}-${reason}`}
                px="4"
                py="3"
                borderBottomWidth="1px"
                borderColor="border"
                _last={{ borderBottomWidth: 0 }}
              >
                <Flex align="center" justify="space-between" gap="2">
                  <Text fontSize="sm" fontWeight="medium" minW="0">
                    {task.title}
                  </Text>
                  <Badge colorPalette="red" variant="subtle" flexShrink={0}>
                    {reason}
                  </Badge>
                </Flex>
                <Flex align="center" gap="2" mt="2" flexWrap="wrap">
                  <Badge variant="outline" size="sm">
                    {STATUS_LABELS[task.status]}
                  </Badge>
                  <Badge
                    colorPalette={PRIORITY_COLOR[task.priority]}
                    variant="subtle"
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </Flex>
              </Box>
            ))
          )}
        </Box>
      )}

      <Button
        colorPalette="red"
        size="lg"
        borderRadius="full"
        boxShadow="lg"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Tasks needing attention"
      >
        <FiAlertTriangle />
        {count > 0 && (
          <Text as="span" fontSize="sm" fontWeight="semibold">
            {count}
          </Text>
        )}
      </Button>
    </Box>
  )
}
