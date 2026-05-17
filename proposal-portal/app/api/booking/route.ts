import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await prisma.proposal.findFirst({ where: { userId: session.userId } });
  if (!proposal) return NextResponse.json({ error: "No proposal" }, { status: 404 });

  const bookings = await prisma.booking.findMany({ where: { proposalId: proposal.id } });
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await prisma.proposal.findFirst({
    where: { userId: session.userId },
    include: { bookings: true },
  });

  if (!proposal) return NextResponse.json({ error: "No proposal" }, { status: 404 });
  if (proposal.tier !== "ENHANCED") {
    return NextResponse.json({ error: "Booking only available for Enhanced tier" }, { status: 403 });
  }
  if (proposal.bookings.length >= 5) {
    return NextResponse.json({ error: "All 5 slots already booked" }, { status: 400 });
  }

  const { startTime } = await req.json();
  const start = new Date(startTime);

  if (start <= new Date()) {
    return NextResponse.json({ error: "Slot must be in the future" }, { status: 400 });
  }

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: { proposalId: proposal.id, startTime: start, endTime: end },
  });

  return NextResponse.json(booking);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await req.json();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const proposal = await prisma.proposal.findUnique({ where: { id: booking.proposalId } });
  if (!proposal || proposal.userId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.booking.delete({ where: { id: bookingId } });
  return NextResponse.json({ ok: true });
}
