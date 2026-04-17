'use server';

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth-session';

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
