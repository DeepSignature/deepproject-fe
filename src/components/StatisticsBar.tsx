import { Box, Flex, Text } from '@chakra-ui/react'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import type { ProjectStatisticsResponse } from '../lib/types'

interface Metric {
  key: string
  label: string
  current: number
  previous: number
  format: (value: number) => string
  higherIsBetter: boolean
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

function buildMetrics(data: ProjectStatisticsResponse): Metric[] {
  const { current, previous } = data
  return [
    {
      key: 'created',
      label: 'Created',
      current: current.createdTasks,
      previous: previous.createdTasks,
      format: (v) => String(v),
      higherIsBetter: true,
    },
    {
      key: 'completed',
      label: 'Completed',
      current: current.completedTasks,
      previous: previous.completedTasks,
      format: (v) => String(v),
      higherIsBetter: true,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      current: current.overdueTasks,
      previous: previous.overdueTasks,
      format: (v) => String(v),
      higherIsBetter: false,
    },
    {
      key: 'completionRate',
      label: 'Completion rate',
      current: current.completionRate,
      previous: previous.completionRate,
      format: (v) => `${Math.round(v * 100)}%`,
      higherIsBetter: true,
    },
    {
      key: 'cycleTime',
      label: 'Avg cycle time',
      current: current.avgCycleTimeSeconds,
      previous: previous.avgCycleTimeSeconds,
      format: formatDuration,
      higherIsBetter: false,
    },
  ]
}

function Delta({
  current,
  previous,
  higherIsBetter,
  format,
}: {
  current: number
  previous: number
  higherIsBetter: boolean
  format: (value: number) => string
}) {
  const diff = current - previous
  if (previous === 0 || diff === 0) {
    return (
      <Text fontSize="xs" color="fg.muted">
        {previous === 0 ? '—' : 'No change'}
      </Text>
    )
  }
  const improved = diff > 0 ? higherIsBetter : !higherIsBetter
  const color = improved ? 'fg.success' : 'fg.error'
  const Arrow = diff > 0 ? FiArrowUp : FiArrowDown
  return (
    <Flex align="center" gap="1" color={color}>
      <Arrow size={12} />
      <Text fontSize="xs">{format(Math.abs(diff))}</Text>
    </Flex>
  )
}

export default function StatisticsBar({
  data,
}: {
  data: ProjectStatisticsResponse | null
}) {
  if (!data) return null

  return (
    <Flex gap="4" px="6" pt="4" pb="4" flexWrap="wrap">
      {buildMetrics(data).map((metric) => (
        <Box
          key={metric.key}
          minW="140px"
          flex="1"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.muted"
          p="3"
        >
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase">
            {metric.label}
          </Text>
          <Text fontSize="xl" fontWeight="semibold" mt="1">
            {metric.format(metric.current)}
          </Text>
          <Delta
            current={metric.current}
            previous={metric.previous}
            higherIsBetter={metric.higherIsBetter}
            format={metric.format}
          />
        </Box>
      ))}
    </Flex>
  )
}
