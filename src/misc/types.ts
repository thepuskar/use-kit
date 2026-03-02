export type AsyncState<T> = { loading: boolean; value?: T; error?: any };

export type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;

export type FunctionReturningPromise<T = any> = (...args: any[]) => Promise<T>;

export type AsyncFnReturn<T extends FunctionReturningPromise> = [
  AsyncState<PromiseType<ReturnType<T>>>,
  T,
];
