import { createClient } from "redis";
import type { DayKey } from "./week";

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
	if (!client) {
		client = createClient({ url: process.env.REDIS_URL });
		client.on("error", (err) => console.error("Redis error:", err));
	}
	return client;
}

async function ensureConnected() {
	const c = getClient();
	if (!c.isOpen) {
		await c.connect();
	}
	return c;
}

export async function togglePresence(
	key: string,
	userId: string,
): Promise<boolean> {
	const c = await ensureConnected();
	const isMember = await c.sIsMember(key, userId);
	if (isMember) {
		await c.sRem(key, userId);
		return false;
	}
	await c.sAdd(key, userId);
	return true;
}

export async function getDayAttendees(key: string): Promise<string[]> {
	const c = await ensureConnected();
	return c.sMembers(key);
}

export async function getWeekAttendees(
	isoWeekKey: string,
	days: DayKey[],
): Promise<Record<DayKey, string[]>> {
	const c = await ensureConnected();
	const result = {} as Record<DayKey, string[]>;
	await Promise.all(
		days.map(async (day) => {
			const key = `officedays:${isoWeekKey}:${day}`;
			result[day] = await c.sMembers(key);
		}),
	);
	return result;
}

export async function isPresent(key: string, userId: string): Promise<boolean> {
	const c = await ensureConnected();
	return Boolean(await c.sIsMember(key, userId));
}
