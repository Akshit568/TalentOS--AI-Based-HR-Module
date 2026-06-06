import { Outlet } from 'react-router-dom';
import { Briefcase, List, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const LINKS = [
  { to: '/candidate/browse',       label: 'Browse Jobs',    icon: Briefcase },
  { to: '/candidate/applications', label: 'My Applications', icon: List },
  { to: '/candidate/onboarding',   label: 'Onboarding',      icon: CheckCircle },
];

export default function CandidateLayout() {
  return (
    <div className="flex min-h-screen theme-transition" style={{ backgroundColor: 'var(--c-base)' }}>
      <Sidebar links={LINKS} />
      <main className="flex-1 ml-[232px] min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
