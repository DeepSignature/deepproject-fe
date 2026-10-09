import { Center, Heading, Text, VStack } from '@chakra-ui/react'

export default function HomePage() {
  return (
    <Center flex="1" p="8">
      <VStack gap="2" maxW="md" textAlign="center">
        <Heading size="lg">Welcome to Deep Project</Heading>
        <Text color="fg.muted" fontSize="sm">
          Select a workspace and project from the sidebar to open its
          dashboard.
        </Text>
      </VStack>
    </Center>
  )
}
