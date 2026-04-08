import { useEffect, useLayoutEffect } from "react";

/**
 * React hook that is designed to be used in an isomorphic or universal application, where the code is executed on both the server and the client.
 **/
export const useIsomorphicEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
