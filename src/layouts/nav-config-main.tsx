import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

// Tambahkan menu baru SETELAH halamannya ada (path dari paths.ts, bukan '#').
export const navData = [
  { title: 'Ringkasan', path: paths.dashboard },
  { title: 'Transaksi', path: paths.transactions },
  { title: 'Rencana', path: paths.plan },
  { title: 'Wawasan', path: paths.insights },
];
