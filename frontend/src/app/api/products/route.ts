import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models';

// GET all products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const product = await Product.create(body);
    
    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create product'
    }, { status: 400 });
  }
}