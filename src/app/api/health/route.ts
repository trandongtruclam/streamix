export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy' });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy' },
      { status: 503 }
    );
  }
}
