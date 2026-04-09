'use server'

/**
 * Validates the admin registration key on the server.
 * This prevents the key from being exposed to the client-side JavaScript bundle.
 */
export async function validateRegistrationKey(inputKey: string): Promise<boolean> {
  const secretKey = process.env.ADMIN_REGISTRATION_KEY
  
  if (!secretKey) {
    console.error("ADMIN_REGISTRATION_KEY is not set in environment variables.")
    return false
  }

  return inputKey === secretKey
}

/**
 * Checks if a user's email is in the admin whitelist.
 */
export async function isUserAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return adminEmails.includes(email)
}
