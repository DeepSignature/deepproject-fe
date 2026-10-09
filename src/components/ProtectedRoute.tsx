import { Center, Spinner } from '@chakra-ui/react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'

export default function ProtectedRoute() {
  const { initialized, authenticated, loading } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" />
      </Center>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
