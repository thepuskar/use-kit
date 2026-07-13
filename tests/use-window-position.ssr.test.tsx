// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWindowPosition } from "../src/client/hooks";

describe("useWindowPosition SSR", () => {
  it("renders without accessing window", () => {
    function ServerScroll() {
      const { x, y } = useWindowPosition();
      return <span>{`${x},${y}`}</span>;
    }

    expect(() => renderToString(<ServerScroll />)).not.toThrow();
    expect(renderToString(<ServerScroll />)).toContain("<span>0,0</span>");
  });
});
