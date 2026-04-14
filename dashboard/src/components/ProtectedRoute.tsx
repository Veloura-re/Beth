'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const { role } = JSON.parse(userData);

    if (role === 'SUPERADMIN' || (allowedRoles && allowedRoles.includes(role))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // Not allowed on this specific route - redirect to their primary page
      if (role === 'SUPERADMIN') router.push('/admins');
      else if (role === 'AGENT') router.push('/agents');
      else router.push('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [router, pathname, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
           <div className="text-[9px] font-black tracking-[0.4em] uppercase text-white/40">Auditing Access Protocol...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
