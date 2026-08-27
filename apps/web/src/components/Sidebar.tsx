import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/dispatch', label: 'Dispatch' }
];

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc = useLocation();
  return (
    <div className="flex h-screen">
      <aside className="sidebar p-4 text-white">
        <div className="mb-6 flex items-center gap-3">
          <img src="/assets/brand/fs-logo-light.png" alt="FS" className="w-10 h-10" />
          <div>
            <div className="font-bold">FS Softwares</div>
            <div className="text-sm text-muted-text">TophComm</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`block px-3 py-2 rounded ${loc.pathname === n.to ? 'bg-fs-green text-dark-bg' : 'text-white hover:bg-opacity-10'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <footer className="mt-auto text-xs text-muted-text pt-6">© 2026 TophComm Engineering & System Solutions Inc.</footer>
      </aside>
      <main className="flex-1 p-6 bg-dark-bg overflow-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
