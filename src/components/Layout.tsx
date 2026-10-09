import { Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      <Sidebar />
      <Flex as="main" flex="1" direction="column" overflowY="auto" minW="0" bg="bg">
        <Outlet />
      </Flex>
    </Flex>
  )
}
