import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposal = await prisma.proposal.findFirst({
    where: { userId: session.userId },
    include: { bookings: true, payment: true },
  });

  if (!proposal) return NextResponse.json({ error: "No proposal" }, { status: 404 });
  if (proposal.payment) return NextResponse.json({ error: "Already paid" }, { status: 400 });

  if (proposal.tier === "ENHANCED" && proposal.bookings.length < 5) {
    return NextResponse.json(
      { error: "Must book all 5 training slots before paying" },
      { status: 400 }
    );
  }

  const amount = proposal.tier === "ENHANCED" ? 2500 : 1000;

  const payment = await prisma.payment.create({
    data: { proposalId: proposal.id, amount, status: "PAID" },
  });

  await prisma.proposal.update({ where: { id: proposal.id }, data: { status: "CONFIRMED" } });

  return NextResponse.json(payment);
}
