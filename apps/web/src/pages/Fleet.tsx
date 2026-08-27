import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Vehicle = {
  id: string;
  plateNumber: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
};

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await axios.get('/api/fleet');
  return data;
};

const Fleet: React.FC = () => {
  const { data, isLoading, error } = useQuery(['vehicles'], fetchVehicles);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fleet Management</h1>
      <div className="card">
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-400">Failed to load vehicles</div>}
        <ul>
          {data?.map((v) => (
            <li key={v.id} className="py-2 border-b border-gray-700">{v.plateNumber} — {v.make ?? ''} {v.model ?? ''} ({v.year ?? '-'})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Fleet;
