import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchKpis = async () => {
  const { data } = await axios.get('/api/health');
  return data;
};

const Dashboard: React.FC = () => {
  const { data } = useQuery(['kpis'], fetchKpis, { refetchOnWindowFocus: false });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card">Total Vehicles: <strong>—</strong></div>
        <div className="card">Active Bookings: <strong>—</strong></div>
        <div className="card">Revenue (MTD): <strong>—</strong></div>
      </div>
      <div className="mt-6 card">
        <h2 className="font-semibold">System Health</h2>
        <pre className="text-sm mt-2">{JSON.stringify(data ?? { ok: false }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Dashboard;
