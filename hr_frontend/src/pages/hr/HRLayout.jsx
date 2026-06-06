import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Upload } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const LINKS = [
  { to: '/hr/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/hr/jobs',            label: 'Job Openings',    icon: Briefcase },
  { to: '/hr/bulk-screening',  label: 'Bulk Screening',  icon: Upload },
];

export default function HRLayout() {
  return (
    <div className="flex min-h-screen theme-transition" style={{ backgroundColor: 'var(--c-base)' }}>
      <Sidebar links={LINKS} />
      <main className="flex-1 ml-[232px] min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
