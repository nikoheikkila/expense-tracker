import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, test } from "vitest";

import App from "../src/App";

describe("App", () => {
	test("renders", () => {
		render(<App />);

		expect(screen.getByText("Vite + React")).toBeVisible();
	});
});
