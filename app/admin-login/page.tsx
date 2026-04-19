import { redirect } from 'next/navigation'
import { ADMIN_LOGIN_PATH } from '@/lib/admin-auth'

export default function LegacyAdminLoginPage() {
  redirect(ADMIN_LOGIN_PATH)
}
