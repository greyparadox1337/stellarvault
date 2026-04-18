import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VaultActivity from "@/lib/models/VaultActivity";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userAddress, type, amount, txHash } = body;

    if (!userAddress || !type || !amount || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const activity = await VaultActivity.create({
      userAddress,
      type,
      amount,
      txHash,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error("Error recording vault activity:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate transaction hash" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get("userAddress");

    const query = userAddress ? { userAddress } : {};
    const activities = await VaultActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(20);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching vault history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
