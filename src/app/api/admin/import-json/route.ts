import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { importVehicleJson, importVehicleBatch } from '@/lib/import-vehicle';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if it's a batch import (array) or single vehicle
    if (Array.isArray(body)) {
      const result = await importVehicleBatch(body);
      return NextResponse.json(result);
    }

    // Single vehicle import
    const result = await importVehicleJson(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
