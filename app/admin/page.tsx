import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from '@/lib/admin-auth'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuth = cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'true'

  if (!isAuth) {
    redirect(ADMIN_LOGIN_PATH)
  }

  return <AdminClient />
}
