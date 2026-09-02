import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

export default function FinanceRootPage() {
  redirect(paths.dashboard);
}
