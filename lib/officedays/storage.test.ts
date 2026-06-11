import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getDayAttendees,
	getWeekAttendees,
	isPresent,
	togglePresence,
} from "./storage";

const mockSIsMember = vi.fn();
const mockSAdd = vi.fn();
const mockSRem = vi.fn();
const mockSMembers = vi.fn();

const mockClient = {
	isOpen: true,
	connect: vi.fn(),
	on: vi.fn(),
	sIsMember: mockSIsMember,
	sAdd: mockSAdd,
	sRem: mockSRem,
	sMembers: mockSMembers,
};

vi.mock("redis", () => ({
	createClient: vi.fn(() => mockClient),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	vi.resetModules();
});

describe("togglePresence", () => {
	it("adds user when not present, returns true", async () => {
		mockSIsMember.mockResolvedValue(false);
		mockSAdd.mockResolvedValue(1);

		const result = await togglePresence("officedays:2025-W24:monday", "U123");

		expect(mockSAdd).toHaveBeenCalledWith("officedays:2025-W24:monday", "U123");
		expect(result).toBe(true);
	});

	it("removes user when already present, returns false", async () => {
		mockSIsMember.mockResolvedValue(true);
		mockSRem.mockResolvedValue(1);

		const result = await togglePresence("officedays:2025-W24:monday", "U123");

		expect(mockSRem).toHaveBeenCalledWith("officedays:2025-W24:monday", "U123");
		expect(result).toBe(false);
	});
});

describe("getDayAttendees", () => {
	it("returns list of user IDs", async () => {
		mockSMembers.mockResolvedValue(["U123", "U456"]);

		const result = await getDayAttendees("officedays:2025-W24:tuesday");

		expect(result).toEqual(["U123", "U456"]);
		expect(mockSMembers).toHaveBeenCalledWith("officedays:2025-W24:tuesday");
	});

	it("returns empty array when no one is in", async () => {
		mockSMembers.mockResolvedValue([]);

		const result = await getDayAttendees("officedays:2025-W24:friday");

		expect(result).toEqual([]);
	});
});

describe("getWeekAttendees", () => {
	it("returns attendees for all 5 days", async () => {
		mockSMembers.mockResolvedValue([]);

		const days = [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
		] as const;
		const result = await getWeekAttendees("2025-W24", [...days]);

		expect(Object.keys(result)).toHaveLength(5);
		expect(mockSMembers).toHaveBeenCalledTimes(5);
	});
});

describe("isPresent", () => {
	it("returns true when user is present", async () => {
		mockSIsMember.mockResolvedValue(true);

		const result = await isPresent("officedays:2025-W24:monday", "U123");
		expect(result).toBe(true);
	});

	it("returns false when user is not present", async () => {
		mockSIsMember.mockResolvedValue(false);

		const result = await isPresent("officedays:2025-W24:monday", "U999");
		expect(result).toBe(false);
	});
});
