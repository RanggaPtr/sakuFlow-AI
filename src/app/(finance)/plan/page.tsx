import Box from '@mui/material/Box';

import { TransactionList } from 'src/features/finance/components';

export default function PlanPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <TransactionList />
    </Box>
  );
}
