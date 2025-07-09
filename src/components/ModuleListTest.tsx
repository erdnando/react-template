import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

interface Module {
  id: number;
  name: string;
  description?: string;
  path?: string;
  code?: string;
}

const ModuleListTest: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiRequest.get<Module[] | { data: Module[] }>('/Modules');
        let modulesArr: Module[] = [];
        if (Array.isArray(resp.data)) {
          modulesArr = resp.data;
        } else if (resp.data && Array.isArray((resp.data as { data: Module[] }).data)) {
          modulesArr = (resp.data as { data: Module[] }).data;
        }
        setModules(modulesArr);
      } catch (err: any) {
        setError(err.message || 'Error fetching modules');
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Listado de Módulos (Test)</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {modules.map((mod) => (
          <li key={mod.id}>
            <b>{mod.name}</b> {mod.code && <span style={{ color: '#888' }}>({mod.code})</span>}
            {mod.description && <span> - {mod.description}</span>}
          </li>
        ))}
      </ul>
      {modules.length === 0 && !loading && <p>No hay módulos.</p>}
    </div>
  );
};

export default ModuleListTest;
