// Centraliza el orden y agrupación de módulos para el menú lateral y la UI de permisos
// Para mantener ambos alineados

import { Module } from '../hooks/usePermissionsApi';

// Nombres de secciones y los módulos que pertenecen a cada una (por nombre/código)
export const MENU_GROUPS = [
  {
    name: 'main',
    items: ['Home'],
  },
  {
    name: 'work',
    items: ['Tasks', 'Catalogs'],
  },
  {
    name: 'admin',
    items: ['Users', 'Roles', 'Permisos', 'Admin Utilities'],
  },
];

// Función para agrupar módulos según MENU_GROUPS (por nombre)
export function groupModules(modules: Module[]) {
  const groups: Record<string, Module[]> = {};
  MENU_GROUPS.forEach(group => {
    groups[group.name] = group.items
      .map(itemName => modules.find(m => m.name === itemName))
      .filter(Boolean) as Module[];
  });
  // Otros módulos no agrupados
  const groupedNames = MENU_GROUPS.flatMap(g => g.items);
  groups['others'] = modules.filter(m => !groupedNames.includes(m.name));
  return groups;
}

// Función para obtener módulos ordenados igual que el menú lateral
export function getOrderedModules(modules: Module[]): Module[] {
  // Ordena por order y luego por agrupación
  const byOrder = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const grouped = MENU_GROUPS.flatMap(group =>
    group.items
      .map(itemName => byOrder.find(m => m.name === itemName))
      .filter(Boolean) as Module[]
  );
  // Agrega los que no están en grupos al final
  const groupedNames = MENU_GROUPS.flatMap(g => g.items);
  const others = byOrder.filter(m => !groupedNames.includes(m.name));
  return [...grouped, ...others];
}
