import Box from '@mui/material/Box';

import { SettingsPanel } from 'src/features/finance/components';

export default function SettingsPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <SettingsPanel />
    </Box>
  );
}
