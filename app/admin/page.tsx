import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin-auth')?.value === 'true'

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <AdminClient />
}