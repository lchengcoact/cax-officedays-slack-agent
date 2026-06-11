/** @jsxImportSource chat */
import { Actions, Button, Card, CardText, Divider } from "chat";
import type { DayKey } from "./week";
import { DAY_KEYS, DAY_LABELS } from "./week";

interface WeekCardProps {
	weekLabel: string;
	attendees: Record<DayKey, string[]>;
	isoWeekKey: string;
}

function formatAttendeeList(userIds: string[]): string {
	if (userIds.length === 0) return "_No one yet_";
	return userIds.map((id) => `<@${id}>`).join(" ");
}

function pluralize(n: number, singular: string): string {
	return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

function uniqueAttendeeCount(attendees: Record<DayKey, string[]>): number {
	const seen = new Set<string>();
	for (const day of DAY_KEYS) {
		for (const id of attendees[day]) {
			seen.add(id);
		}
	}
	return seen.size;
}

export function WeekCard({ weekLabel, attendees, isoWeekKey }: WeekCardProps) {
	const total = uniqueAttendeeCount(attendees);
	const daysWithSomeone = DAY_KEYS.filter(
		(d) => attendees[d].length > 0,
	).length;

	return (
		<Card title={`🏢 ${weekLabel}`}>
			<CardText>
				*{pluralize(total, "person")}* across {daysWithSomeone} day
				{daysWithSomeone !== 1 ? "s" : ""} this week
			</CardText>
			<Divider />
			{DAY_KEYS.map((day) => (
				<>
					<CardText key={`text_${day}`}>
						*{DAY_LABELS[day]}*{"\n"}
						{pluralize(attendees[day].length, "person")}
						{"\n"}
						{formatAttendeeList(attendees[day])}
					</CardText>
					<Actions key={`actions_${day}`}>
						<Button id={`toggle_${day}`} value={`${isoWeekKey}:${day}`}>
							In/Out
						</Button>
					</Actions>
				</>
			))}
		</Card>
	);
}
