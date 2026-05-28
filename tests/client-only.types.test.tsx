import type { ReactElement } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  ClientFeatureRequirement,
  ClientOnlyProps,
  ClientOnlyState,
  ClientOnlyStrategy,
  MissingClientFeature,
} from "../src/client";
import { ClientOnly } from "../src/client";

describe("ClientOnly types", () => {
  it("exposes the public TypeScript API", () => {
    expectTypeOf<ClientOnlyStrategy>().toEqualTypeOf<"effect" | "idle" | "animation-frame">();
    expectTypeOf<MissingClientFeature>().toEqualTypeOf<keyof ClientFeatureRequirement>();
    expectTypeOf<ClientOnlyState>().toMatchTypeOf<{
      isClient: boolean;
      isReady: boolean;
      isSupported: boolean;
      missingFeatures: MissingClientFeature[];
    }>();

    const props: ClientOnlyProps = {
      fallback: null,
      unsupportedFallback: (missingFeatures) => missingFeatures.join(","),
      delay: 50,
      strategy: "idle",
      require: {
        window: true,
        document: true,
        localStorage: true,
        matchMedia: false,
      },
      onReady: () => undefined,
      onUnsupported: () => undefined,
      onError: () => undefined,
      children: ({ isReady }) => <span>{String(isReady)}</span>,
    };
    const element = (
      <ClientOnly {...props}>
        {({ missingFeatures }) => <span>{missingFeatures.join(",")}</span>}
      </ClientOnly>
    );

    expectTypeOf(element).toMatchTypeOf<ReactElement>();
    expect(props.strategy).toBe("idle");
  });
});
