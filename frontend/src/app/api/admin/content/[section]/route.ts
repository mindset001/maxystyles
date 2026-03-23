import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/content/${section}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch content section');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching content section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content section' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/admin/content/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update content section');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating content section:', error);
    return NextResponse.json(
      { error: 'Failed to update content section' },
      { status: 500 }
    );
  }
}