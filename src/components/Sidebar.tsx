import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { FiFolder, FiLayers, FiLogOut } from 'react-icons/fi'
import { Link as RouterLink, useMatch } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { api } from '../lib/api'
import type { ProjectResponse, WorkspaceResponse } from '../lib/types'

const truncate = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

export default function Sidebar() {
  const { user, logout } = useAuth()

  const workspaceMatch = useMatch('/workspaces/:workspaceId')
  const projectMatch = useMatch(
    '/workspaces/:workspaceId/projects/:projectId',
  )

  const selectedWorkspaceId =
    projectMatch?.params.workspaceId ??
    workspaceMatch?.params.workspaceId ??
    null
  const selectedProjectId = projectMatch?.params.projectId ?? null

  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[] | null>(null)
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<
    Record<string, ProjectResponse[]>
  >({})

  useEffect(() => {
    if (!user) return
    const currentUser = user

    let cancelled = false

    async function load() {
      try {
        const page = await api.listWorkspaces(currentUser.userId)
        if (cancelled) return
        setWorkspaces(page.items)
      } catch {
        if (cancelled) return
        setWorkspaces([])
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!selectedWorkspaceId) return
    if (projectsByWorkspace[selectedWorkspaceId] !== undefined) return

    const workspaceId: string = selectedWorkspaceId
    let cancelled = false

    async function load() {
      try {
        const page = await api.listProjects(workspaceId)
        if (cancelled) return
        setProjectsByWorkspace((prev) => ({
          ...prev,
          [workspaceId]: page.items,
        }))
      } catch {
        if (cancelled) return
        setProjectsByWorkspace((prev) => ({
          ...prev,
          [workspaceId]: [],
        }))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [selectedWorkspaceId, projectsByWorkspace])

  return (
    <Flex
      direction="column"
      w="260px"
      h="full"
      flexShrink={0}
      borderRightWidth="1px"
      borderColor="border"
      bg="bg.muted"
    >
      <Flex
        align="center"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Link asChild fontWeight="semibold" fontSize="sm" color="fg">
          <RouterLink to="/">Deep Project</RouterLink>
        </Link>
      </Flex>

      <Flex direction="column" flex="1" overflowY="auto" px="2" py="3" gap="1">
        <Text
          px="2"
          pb="1"
          fontSize="xs"
          fontWeight="medium"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Workspaces
        </Text>

        {workspaces === null ? (
          <Flex align="center" gap="2" px="2" py="1">
            <Spinner size="xs" />
            <Text fontSize="sm" color="fg.muted">
              Loading…
            </Text>
          </Flex>
        ) : workspaces.length === 0 ? (
          <Text px="2" fontSize="sm" color="fg.muted">
            No workspaces yet.
          </Text>
        ) : (
          workspaces.map((workspace) => {
            const wsActive = selectedWorkspaceId === workspace.id
            const wsProjects = projectsByWorkspace[workspace.id]
            const wsLoading = wsActive && wsProjects === undefined
            const projects = wsProjects ?? []

            return (
              <Box key={workspace.id}>
                <Button
                  asChild
                  variant={wsActive ? 'subtle' : 'ghost'}
                  colorPalette="blue"
                  size="sm"
                  w="full"
                  justifyContent="flex-start"
                  fontWeight={wsActive ? 'medium' : 'normal'}
                >
                  <RouterLink to={`/workspaces/${workspace.id}`}>
                    <FiLayers size={16} />
                    <Text as="span" flex="1" textAlign="left" {...truncate}>
                      {workspace.name}
                    </Text>
                  </RouterLink>
                </Button>

                {wsActive && (
                  <Box
                    ml="4"
                    mt="1"
                    pl="2"
                    borderLeftWidth="1px"
                    borderColor="border"
                  >
                    {wsLoading ? (
                      <Flex align="center" gap="2" px="2" py="1">
                        <Spinner size="xs" />
                        <Text fontSize="sm" color="fg.muted">
                          Loading…
                        </Text>
                      </Flex>
                    ) : projects.length === 0 ? (
                      <Text px="2" py="1" fontSize="sm" color="fg.muted">
                        No projects.
                      </Text>
                    ) : (
                      projects.map((project) => {
                        const pActive = selectedProjectId === project.id
                        return (
                          <Button
                            key={project.id}
                            asChild
                            variant={pActive ? 'subtle' : 'ghost'}
                            colorPalette="blue"
                            size="sm"
                            w="full"
                            justifyContent="flex-start"
                            fontWeight={pActive ? 'medium' : 'normal'}
                          >
                            <RouterLink
                              to={`/workspaces/${workspace.id}/projects/${project.id}`}
                            >
                              <FiFolder size={16} />
                              <Text
                                as="span"
                                flex="1"
                                textAlign="left"
                                {...truncate}
                              >
                                {project.name}
                              </Text>
                            </RouterLink>
                          </Button>
                        )
                      })
                    )}
                  </Box>
                )}
              </Box>
            )
          })
        )}
      </Flex>

      <Flex
        align="center"
        gap="2"
        px="4"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Box minW="0" flex="1">
          <Text fontSize="sm" fontWeight="medium" {...truncate}>
            {user?.displayName ?? user?.username ?? 'User'}
          </Text>
          <Text fontSize="xs" color="fg.muted" {...truncate}>
            {user?.email}
          </Text>
        </Box>
        <IconButton
          aria-label="Sign out"
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
        >
          <FiLogOut />
        </IconButton>
      </Flex>
    </Flex>
  )
}
