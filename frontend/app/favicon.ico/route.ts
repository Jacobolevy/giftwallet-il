import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  // Some browsers/extensions request /favicon.ico by default.
  // We redirect to the SVG icon we ship in /public to avoid a 404.
  return NextResponse.redirect(new URL('/icon.svg', request.url), 307);
}


