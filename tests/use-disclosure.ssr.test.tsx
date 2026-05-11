// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDisclosure } from "../src/client/hooks";

describe("useDisclosure SSR", () => {
  it("renders safely on the server", () => {
    function ServerRenderedDisclosure() {
      const { isOpen } = useDisclosure({
        defaultOpen: true,
      });

      return <span>{String(isOpen)}</span>;
    }

    expect(renderToString(<ServerRenderedDisclosure />)).toContain("<span>true</span>");
  });
});
