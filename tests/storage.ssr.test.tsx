// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useLocalStorage, useSessionStorage } from "../src/client/hooks";

describe("storage SSR", () => {
  it("renders useLocalStorage with the initial value and unsupported flag", () => {
    function ServerStorage() {
      const { value, isSupported } = useLocalStorage("ssr-local", "server-default");
      return <span>{`${value}:${String(isSupported)}`}</span>;
    }

    expect(renderToString(<ServerStorage />)).toContain("<span>server-default:false</span>");
  });

  it("renders useSessionStorage with the initial value and unsupported flag", () => {
    function ServerStorage() {
      const { value, isSupported } = useSessionStorage("ssr-session", "session-default");
      return <span>{`${value}:${String(isSupported)}`}</span>;
    }

    expect(renderToString(<ServerStorage />)).toContain("<span>session-default:false</span>");
  });
});
