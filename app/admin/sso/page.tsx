import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import SectionNav from '@/components/SectionNav';
import AdminSsoPortal from '@/components/admin/AdminSsoPortal';

export const dynamic = 'force-dynamic';

export default async function AdminSsoPage() {
  const session = await auth();
  if (!isAdminSession(session)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SectionNav
        showOverview={true}
        userEmail={session?.user?.email ?? undefined}
        isAdmin={isAdminSession(session)}
      />
      <AdminSsoPortal />
    </div>
  );
}
