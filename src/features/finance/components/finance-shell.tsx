'use client';

import type { ReactNode } from 'react';

import { useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { paths } from 'src/routes/paths';

import { FinanceGuard } from './finance-guard';

export function FinanceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  const navigationItems = [
    ['Beranda', paths.dashboard],
    ['Transaksi', paths.transactions],
    ['Rencana', paths.plan],
    ['Insight', paths.insights],
    ['Pengaturan', paths.settings],
  ] as const;

  return (
    <FinanceGuard>
      <Box
        sx={{ pb: { xs: 7, md: 0 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          component="nav"
          aria-label="Navigasi utama"
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 1,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {navigationItems.map(([label, value]) => (
            <Button
              key={value}
              href={value}
              onClick={(event) => {
                event.preventDefault();
                handleChange(event, value);
              }}
              aria-current={pathname === value ? 'page' : undefined}
              sx={{ minHeight: 48, px: 2 }}
            >
              {label}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        <BottomNavigation
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
          value={pathname}
          onChange={handleChange}
          showLabels
        >
          {navigationItems.map(([label, value]) => (
            <BottomNavigationAction
              key={value}
              label={label}
              value={value}
              aria-current={pathname === value ? 'page' : undefined}
              sx={{ minHeight: 56, px: 1 }}
            />
          ))}
        </BottomNavigation>
      </Box>
    </FinanceGuard>
  );
}
