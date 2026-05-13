// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useBreakpoint, useMediaQueries, useMediaQuery } from "../src/client/hooks";

describe("useMediaQuery SSR", () => {
  it("renders useMediaQuery safely on the server with the ssrValue snapshot", () => {
    function ServerRenderedQuery() {
      const result = useMediaQuery("(min-width: 1024px)", {
        defaultValue: false,
        ssrValue: true,
      });

      return <span>{`${String(result.matches)}:${String(result.supported)}`}</span>;
    }

    expect(renderToString(<ServerRenderedQuery />)).toContain("<span>true:false</span>");
  });

  it("renders useMediaQueries and useBreakpoint safely on the server", () => {
    function ServerRenderedQueries() {
      const screens = useMediaQueries(
        {
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 1024px)",
        },
        {
          ssrValue: false,
        },
      );
      const breakpoint = useBreakpoint({
        ssrValue: false,
      });

      return (
        <span>{`${String(screens.mobile)}:${breakpoint.breakpoint ?? "base"}:${String(
          breakpoint.supported,
        )}`}</span>
      );
    }

    expect(renderToString(<ServerRenderedQueries />)).toContain("<span>false:base:false</span>");
  });
});
