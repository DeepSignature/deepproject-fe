import { Box, Button, Center, Heading, Text, VStack } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

export default function LoginPage() {
  const { initialized, authenticated, login } = useAuth()

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Center minH="100vh" p="4">
      <Box
        w="full"
        maxW="sm"
        borderWidth="1px"
        borderColor="border"
        rounded="xl"
        p="8"
        shadow="sm"
        bg="bg"
      >
        <VStack gap="1" mb="6">
          <Heading size="xl">Deep Project</Heading>
          <Text color="fg.muted" fontSize="sm">
            Sign in to continue
          </Text>
        </VStack>

        <Button
          w="full"
          colorPalette="blue"
          loading={!initialized}
          onClick={() => void login()}
        >
          Sign in with Keycloak
        </Button>
      </Box>
    </Center>
  )
}
