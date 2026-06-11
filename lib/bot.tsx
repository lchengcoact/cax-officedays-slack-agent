/** @jsxImportSource chat */

import { createSlackAdapter } from "@chat-adapter/slack";
import { createRedisState } from "@chat-adapter/state-redis";
import { Chat } from "chat";
import { WeekCard } from "./officedays/card";
import { getWeekAttendees, togglePresence } from "./officedays/storage";
import {
	DAY_KEYS,
	type DayKey,
	getWeekInfo,
	redisKey,
} from "./officedays/week";

export const bot = new Chat({
	userName: "officedays",
	adapters: {
		slack: createSlackAdapter(),
	},
	state: createRedisState(),
});

bot.onSlashCommand("/officedays", async (event) => {
	const isNext = event.text.trim().toLowerCase() === "next";
	const week = getWeekInfo(isNext ? 1 : 0);
	const attendees = await getWeekAttendees(week.isoWeekKey, DAY_KEYS);

	await event.channel.post(
		<WeekCard
			weekLabel={week.label}
			attendees={attendees}
			isoWeekKey={week.isoWeekKey}
		/>,
	);
});

bot.onAction(async (event) => {
	const { actionId, value, user } = event;

	if (!actionId.startsWith("toggle_") || !value) return;

	const colonIdx = value.indexOf(":");
	if (colonIdx === -1) return;

	const isoWeekKey = value.slice(0, colonIdx);
	const day = value.slice(colonIdx + 1) as DayKey;

	if (!DAY_KEYS.includes(day)) return;

	const key = redisKey(isoWeekKey, day);
	await togglePresence(key, user.userId);

	const currentWeek = getWeekInfo(0);
	const nextWeek = getWeekInfo(1);
	const targetWeek =
		isoWeekKey === currentWeek.isoWeekKey ? currentWeek : nextWeek;

	const attendees = await getWeekAttendees(isoWeekKey, DAY_KEYS);

	if (event.thread) {
		await event.thread.post(
			<WeekCard
				weekLabel={targetWeek.label}
				attendees={attendees}
				isoWeekKey={isoWeekKey}
			/>,
		);
	}
});

export async function postWeeklySummary(channelId: string) {
	const week = getWeekInfo(0);
	const attendees = await getWeekAttendees(week.isoWeekKey, DAY_KEYS);
	const channel = bot.channel(`slack:${channelId}`);

	await channel.post(
		<WeekCard
			weekLabel={week.label}
			attendees={attendees}
			isoWeekKey={week.isoWeekKey}
		/>,
	);
}

export default bot;
