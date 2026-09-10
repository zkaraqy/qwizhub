export default defineNuxtRouteMiddleware((to, from) => {
  const { status, data } = useAuth()

  // List of protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile']
  
  // List of auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register', '/forgot-password']

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => to.path.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && status.value === 'unauthenticated') {
    return navigateTo('/login')
  }

  // If user is authenticated and trying to access auth routes (login, register, etc)
  if (isAuthRoute && status.value === 'authenticated') {
    return navigateTo('/dashboard')
  }
})
