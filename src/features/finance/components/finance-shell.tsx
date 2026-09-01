'use client';

import type { ReactNode } from 'react';

import { useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { FinanceGuard } from './finance-guard';

export function FinanceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <FinanceGuard>
      <Box sx={{ pb: 7, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        <BottomNavigation
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
          value={pathname}
          onChange={handleChange}
        >
          <BottomNavigationAction label="Dashboard" value="/dashboard" />
          <BottomNavigationAction label="Riwayat" value="/plan" />
          <BottomNavigationAction label="Settings" value="/settings" />
        </BottomNavigation>
      </Box>
    </FinanceGuard>
  );
}
