import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <Flex direction="column" flex="1">
      <Box borderBottomWidth="1px" borderColor="border" px="6" py="4">
        <Heading size="md">Project Dashboard</Heading>
        <Text color="fg.muted" fontSize="xs">
          {projectId}
        </Text>
      </Box>
      <Center flex="1" p="8">
        <Text color="fg.muted" fontSize="sm">
          Kanban board coming soon.
        </Text>
      </Center>
    </Flex>
  )
}
