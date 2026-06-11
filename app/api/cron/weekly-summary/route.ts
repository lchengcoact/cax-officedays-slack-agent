import { type NextRequest, NextResponse } from "next/server";
import { postWeeklySummary } from "@/lib/bot";

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const channelId = process.env.OFFICEDAYS_CHANNEL_ID;
	if (!channelId) {
		return NextResponse.json(
			{ error: "OFFICEDAYS_CHANNEL_ID not set" },
			{ status: 500 },
		);
	}

	await postWeeklySummary(channelId);
	return NextResponse.json({ success: true });
}
