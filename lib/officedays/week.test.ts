import { describe, expect, it } from "vitest";
import {
	DAY_KEYS,
	DAY_LABELS,
	type DayKey,
	getWeekInfo,
	redisKey,
	totalPeopleAcrossWeek,
} from "./week";

describe("getWeekInfo", () => {
	it("returns a monday as the first day", () => {
		const { dates } = getWeekInfo(0);
		expect(dates.monday.getDay()).toBe(1);
	});

	it("returns a friday as the last day", () => {
		const { dates } = getWeekInfo(0);
		expect(dates.friday.getDay()).toBe(5);
	});

	it("friday is 4 days after monday", () => {
		const { dates } = getWeekInfo(0);
		const diff =
			(dates.friday.getTime() - dates.monday.getTime()) / (1000 * 60 * 60 * 24);
		expect(diff).toBe(4);
	});

	it("isoWeekKey matches YYYY-Www format", () => {
		const { isoWeekKey } = getWeekInfo(0);
		expect(isoWeekKey).toMatch(/^\d{4}-W\d{2}$/);
	});

	it("offsetWeeks=1 returns next week", () => {
		const thisWeek = getWeekInfo(0);
		const nextWeek = getWeekInfo(1);
		const diffMs =
			nextWeek.dates.monday.getTime() - thisWeek.dates.monday.getTime();
		expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
	});

	it("label includes month abbreviation and day numbers", () => {
		const { label } = getWeekInfo(0);
		expect(label).toMatch(/\w{3} \d+/);
	});
});

describe("redisKey", () => {
	it("formats as officedays:week:day", () => {
		expect(redisKey("2025-W24", "monday")).toBe("officedays:2025-W24:monday");
	});

	it("works for all day keys", () => {
		for (const day of DAY_KEYS) {
			const key = redisKey("2025-W01", day);
			expect(key).toBe(`officedays:2025-W01:${day}`);
		}
	});
});

describe("totalPeopleAcrossWeek", () => {
	it("sums counts across all days", () => {
		const counts: Record<DayKey, number> = {
			monday: 2,
			tuesday: 3,
			wednesday: 0,
			thursday: 1,
			friday: 4,
		};
		expect(totalPeopleAcrossWeek(counts)).toBe(10);
	});

	it("returns 0 when no one is in", () => {
		const counts: Record<DayKey, number> = {
			monday: 0,
			tuesday: 0,
			wednesday: 0,
			thursday: 0,
			friday: 0,
		};
		expect(totalPeopleAcrossWeek(counts)).toBe(0);
	});
});

describe("DAY_KEYS and DAY_LABELS", () => {
	it("has exactly 5 days", () => {
		expect(DAY_KEYS).toHaveLength(5);
	});

	it("starts with monday", () => {
		expect(DAY_KEYS[0]).toBe("monday");
	});

	it("ends with friday", () => {
		expect(DAY_KEYS[4]).toBe("friday");
	});

	it("all keys have labels", () => {
		for (const day of DAY_KEYS) {
			expect(DAY_LABELS[day]).toBeTruthy();
		}
	});
});
