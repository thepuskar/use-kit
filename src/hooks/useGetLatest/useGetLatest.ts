import { MutableRefObject, useRef } from "react";

import { useIsomorphicEffect } from "../useIsomorphicEffect";

/**
 * Keep a ref synchronized with the latest value (useful inside stable callbacks/effects).
 */
export const useGetLatest = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef<T>(value);

  useIsomorphicEffect(() => {
    ref.current = value;
  });

  return ref;
};
