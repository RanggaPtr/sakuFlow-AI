import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { InsightsOverview } from 'src/features/finance/components';

export default function InsightsPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Insight Keuangan
      </Typography>
      <InsightsOverview />
    </Box>
  );
}
