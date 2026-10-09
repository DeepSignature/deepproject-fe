import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

let initPromise: Promise<boolean> | null = null

export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    })
  }
  return initPromise
}

let refreshPromise: Promise<boolean> | null = null

export function updateToken(minValidity = 30): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = keycloak
      .updateToken(minValidity)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export default keycloak
