import { MutableRefObject, useRef } from "react";

import { useIsomorphicEffect } from "../index";

/**
 * It is a React hook that stores & updates ref.current with the most recent value.
 * @param {T} value - T - The value you want to store in the ref.
 * @returns A ref object that is updated with the latest value of the value argument.
 */
export const useGetLatest = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef<T>(value);

  useIsomorphicEffect(() => {
    void (ref.current = value);
  });
  return ref;
};
