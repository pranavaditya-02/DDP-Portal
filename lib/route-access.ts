import type { AccessResource } from '@/lib/store'

export type MinimalAccessResource = Pick<AccessResource, 'href' | 'label' | 'group'>

const GROUP_ORDER = ['Overview', 'Student', 'Faculty', 'Department', 'College', 'Management', 'Other']

export const normalizePath = (value: string) => {
  if (!value || value === '/') return '/'
  return value.replace(/\/+$/, '')
}

export const isDynamicPatternRoute = (value: string) => /\[[^\]]+\]/.test(value)

export const shouldHideInNavigation = (route: string) => {
  const normalizedRoute = normalizePath(route)
  return normalizedRoute.endsWith('/submit')
}

export const routeToGroup = (route: string) => {
  if (route.startsWith('/student')) return 'Student'
  if (route.startsWith('/achievements') || route.startsWith('/activities') || route.startsWith('/action-plan') || route.startsWith('/faculty')) return 'Faculty'
  if (route.startsWith('/department') || route.startsWith('/leaderboard')) return 'Department'
  if (route.startsWith('/college')) return 'College'
  if (route.startsWith('/verification') || route.startsWith('/roles') || route.startsWith('/users')) return 'Management'
  return 'Other'
}

export const routeToLabel = (route: string) => {
  const parts = route.split('/').filter(Boolean)
  const tail = parts[parts.length - 1] || 'dashboard'
  return tail
    .replace(/\[(\.\.\.)?([^\]]+)\]/g, '$2')
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

export const sortLikeSidebar = <T extends { href: string; label: string; group: string }>(items: T[]) => {
  return [...items].sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a.group)
    const bi = GROUP_ORDER.indexOf(b.group)
    if (ai !== bi) {
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    }
    return a.label.localeCompare(b.label)
  })
}

const buildVisibleRouteItems = ({
  resources,
  routePaths,
}: {
  resources?: MinimalAccessResource[]
  routePaths?: string[]
}) => {
  const fromResources = (resources || [])
    .map((resource) => ({
      href: normalizePath(resource.href),
      label: resource.label || routeToLabel(resource.href),
      group: resource.group || routeToGroup(resource.href),
    }))
    .filter((route) => route.href !== '/' && route.href !== '/login' && route.href !== '/register')
    .filter((route) => !isDynamicPatternRoute(route.href))
    .filter((route) => !shouldHideInNavigation(route.href))

  if (fromResources.length > 0) {
    return sortLikeSidebar(fromResources)
  }

  return (routePaths || [])
    .map((route) => normalizePath(route))
    .filter((route) => route !== '/' && route !== '/login' && route !== '/register')
    .filter((route) => !isDynamicPatternRoute(route))
    .filter((route) => !shouldHideInNavigation(route))
    .map((route) => ({ href: route, label: routeToLabel(route), group: routeToGroup(route) }))
    .sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.group)
      const bi = GROUP_ORDER.indexOf(b.group)
      if (ai !== bi) {
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      }
      return a.label.localeCompare(b.label)
    })
}

export const pickFirstAccessibleRoute = ({
  resources,
  routePaths,
}: {
  resources?: MinimalAccessResource[]
  routePaths?: string[]
}) => {
  const items = buildVisibleRouteItems({ resources, routePaths })
  return items[0]?.href || null
}

export const routePatternToRegex = (pattern: string) => {
  const escaped = normalizePath(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\.\.\.([^\]]+)\\\]/g, '.+')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+')

  return new RegExp(`^${escaped}$`)
}

export const hasRouteAccess = (pathname: string, allowedRoutes: string[]) => {
  if (allowedRoutes.length === 0) return true

  const normalizedPath = normalizePath(pathname)

  if (normalizedPath.endsWith('/submit')) {
    const parentPath = normalizedPath.replace(/\/submit$/, '') || '/'
    if (allowedRoutes.some((route) => normalizePath(route) === parentPath)) {
      return true
    }
  }

  return allowedRoutes.some((route) => {
    const normalizedRoute = normalizePath(route)
    if (normalizedRoute === normalizedPath) return true
    if (!normalizedRoute.includes('[')) return false
    return routePatternToRegex(normalizedRoute).test(normalizedPath)
  })
}