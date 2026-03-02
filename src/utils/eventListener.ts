/**
 * `onEvent` is a function that adds an event listener to an object, such as a DOM element or a window object
 * @param {T | null} obj - T | null
 * @param {Parameters<T['addEventListener']> | [string, Function | null, ...any]} args -
 * Parameters<T['addEventListener']> | [string, Function | null, ...any]
 */

export function onEvent<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["addEventListener"]>
    | [string, EventListenerOrEventListenerObject | null, ...unknown[]]
): void {
  if (obj && obj.addEventListener) {
    obj.addEventListener(...(args as Parameters<HTMLElement["addEventListener"]>));
  }
}

/**
 * `offEvent` is a function that that removes an event listener from an object, such as a DOM element or a window object
 * @param {T | null} obj - T | null
 * @param {| Parameters<T['removeEventListener']>
 *     | [string, Function | null, ...any]} args - The arguments to pass to the removeEventListener
 * function.
 */
export function offEvent<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["removeEventListener"]>
    | [string, EventListenerOrEventListenerObject | null, ...unknown[]]
): void {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(...(args as Parameters<HTMLElement["removeEventListener"]>));
  }
}
