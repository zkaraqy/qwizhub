import { getServerSession } from '#auth'
import { User } from '~~/server/models/User'
import type { H3Event } from 'h3'

/**
 * Get the authenticated user from the current request session.
 * Returns the full User model instance (excluding password).
 * Throws 401 if not authenticated.
 */
export async function getAuthenticatedUser(event: H3Event): Promise<User> {
  const session = await getServerSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — please log in'
    })
  }

  const user = await User.findOne({
    where: { email: session.user.email },
    attributes: { exclude: ['password'] }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — user not found'
    })
  }

  return user
}

/**
 * Require the authenticated user to have a specific role.
 * Throws 403 if user does not match.
 */
export async function requireRole(event: H3Event, role: 'peneliti' | 'responden'): Promise<User> {
  const user = await getAuthenticatedUser(event)

  if (user.role !== role) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden — this action requires the "${role}" role`
    })
  }

  return user
}

/**
 * Require the authenticated responden to be verified.
 * Throws 403 if not verified.
 */
export async function requireVerifiedResponden(event: H3Event): Promise<User> {
  const user = await requireRole(event, 'responden')

  if (user.verificationStatus !== 'verified') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — your respondent profile must be verified before performing this action'
    })
  }

  return user
}
