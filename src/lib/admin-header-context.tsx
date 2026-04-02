import { createContext, useContext } from 'react';

export type AdminHeaderControls = {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  refreshCooldownSeconds?: number;
};

export type AdminHeaderContextValue = {
  setHeaderControls: (controls: AdminHeaderControls) => void;
  resetHeaderControls: () => void;
};

export const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null);

export function useAdminHeaderControls() {
  const value = useContext(AdminHeaderContext);
  if (!value) {
    throw new Error('useAdminHeaderControls must be used within the admin layout');
  }
  return value;
}
