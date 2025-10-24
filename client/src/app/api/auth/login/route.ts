import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // TODO: Verify credentials with your database
  
  return NextResponse.json({ success: true });
}