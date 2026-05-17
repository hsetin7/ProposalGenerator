import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let proposal = await prisma.proposal.findFirst({
    where: { userId: session.userId },
    include: { bookings: true, payment: true },
  });

  if (!proposal) {
    proposal = await prisma.proposal.create({
      data: { userId: session.userId },
      include: { bookings: true, payment: true },
    });
  }

  return NextResponse.json(proposal);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await req.json();
  if (!["BASIC", "ENHANCED"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findFirst({ where: { userId: session.userId } });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  const updated = await prisma.proposal.update({
    where: { id: proposal.id },
    data: { tier },
    include: { bookings: true, payment: true },
  });

  return NextResponse.json(updated);
}
