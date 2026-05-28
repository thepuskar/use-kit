// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ClientOnly } from "../src/client";

describe("ClientOnly SSR", () => {
  it("does not access browser globals during SSR render", () => {
    expect(() =>
      renderToString(
        <ClientOnly fallback={<span>Loading</span>} require={{ localStorage: true }}>
          <span>Ready</span>
        </ClientOnly>,
      ),
    ).not.toThrow();
  });

  it("renders fallback HTML on the server instead of children", () => {
    const html = renderToString(
      <ClientOnly fallback={<span>Loading</span>}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(html).toContain("<span>Loading</span>");
    expect(html).not.toContain("Ready");
  });
});
