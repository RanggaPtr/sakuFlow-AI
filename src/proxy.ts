import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

const SHOW_COMPONENTS =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_COMPONENTS === 'true';

export function proxy(request: NextRequest) {
  if (!SHOW_COMPONENTS) {
    return NextResponse.rewrite(new URL('/__components-disabled', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/components/:path*',
};
