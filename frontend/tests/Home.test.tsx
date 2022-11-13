import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, test } from "vitest";

import Home from "../src/views/Home";

describe("Home", () => {
	test("renders", () => {
		render(<Home />);

		expect(screen.getByText("Expenses for this month")).toBeVisible();
	});
});
