'use client';

import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = false,
  ...other
}: LogoProps) {
  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="SakuFlow AI"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 'auto',
          height: 24,
          ...(isSingle && { width: 40, height: 40 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box component="span" aria-hidden="true" sx={{ fontSize: 22, lineHeight: 1 }}>
        ◈
      </Box>
      {!isSingle && (
        <Box component="span" sx={{ ml: 1, fontWeight: 700 }}>
          SakuFlow AI
        </Box>
      )}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'inherit',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
