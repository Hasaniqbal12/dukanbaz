// Basic Next.js API route example
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from DukanBaz API!' });
}