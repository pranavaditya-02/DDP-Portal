import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE_NAME, decodeAuthToken, getPostLoginRoute } from '@/lib/auth-session'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null
  const user = token ? decodeAuthToken(token) : null

  if (!user) {
    redirect('/login')
  }

  redirect(getPostLoginRoute(user.roles))
}
