import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Dispatch from './pages/Dispatch';
import SidebarLayout from './components/Sidebar';
import './styles.css';

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
