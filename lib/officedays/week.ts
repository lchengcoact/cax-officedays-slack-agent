export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export const DAY_KEYS: DayKey[] = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
];

export const DAY_LABELS: Record<DayKey, string> = {
	monday: "Monday",
	tuesday: "Tuesday",
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
};

export interface WeekInfo {
	isoWeekKey: string;
	label: string;
	dates: Record<DayKey, Date>;
}

function getISOWeekNumber(date: Date): number {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
	const week1 = new Date(d.getFullYear(), 0, 4);
	return (
		1 +
		Math.round(
			((d.getTime() - week1.getTime()) / 86400000 -
				3 +
				((week1.getDay() + 6) % 7)) /
				7,
		)
	);
}

export function getWeekInfo(offsetWeeks = 0): WeekInfo {
	const now = new Date();
	now.setDate(now.getDate() + offsetWeeks * 7);

	const dayOfWeek = now.getDay();
	const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	const monday = new Date(now);
	monday.setDate(now.getDate() + diffToMonday);
	monday.setHours(0, 0, 0, 0);

	const year = monday.getFullYear();
	const week = getISOWeekNumber(monday);
	const isoWeekKey = `${year}-W${String(week).padStart(2, "0")}`;

	const friday = new Date(monday);
	friday.setDate(monday.getDate() + 4);

	const label = formatDateRange(monday, friday);

	const dates: Record<DayKey, Date> = {
		monday: new Date(monday),
		tuesday: new Date(monday.getTime() + 86400000),
		wednesday: new Date(monday.getTime() + 2 * 86400000),
		thursday: new Date(monday.getTime() + 3 * 86400000),
		friday: new Date(monday.getTime() + 4 * 86400000),
	};

	return { isoWeekKey, label, dates };
}

function formatDateRange(monday: Date, friday: Date): string {
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const startMonth = monthNames[monday.getMonth()];
	const endMonth = monthNames[friday.getMonth()];
	const startDay = monday.getDate();
	const endDay = friday.getDate();

	if (startMonth === endMonth) {
		return `${startMonth} ${startDay} - ${endDay}`;
	}
	return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

export function redisKey(isoWeekKey: string, day: DayKey): string {
	return `officedays:${isoWeekKey}:${day}`;
}

export function totalPeopleAcrossWeek(counts: Record<DayKey, number>): number {
	return Object.values(counts).reduce((sum, n) => sum + n, 0);
}
