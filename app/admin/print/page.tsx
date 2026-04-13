import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PrintClient from './PrintClient'

export default async function PrintPage() {
  const cookieStore = await cookies()
  const isAuth = cookieStore.get('admin_auth')?.value === 'true'

  if (!isAuth) {
    redirect('/admin-login')
  }

  return <PrintClient />
}