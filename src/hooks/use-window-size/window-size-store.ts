import { WindowSizeStoreSnapshot } from "./window-size.types";
import {
  areWindowSizeStoreSnapshotsEqual,
  createInitialWindowSizeStoreSnapshot,
  CreateWindowSizeStoreSnapshotOptions,
  isWindowSizeBrowser,
  readWindowSizeStoreSnapshot,
} from "./window-size.utils";

interface WindowSizeSubscriptionOptions {
  debounceMs?: number;
  throttleMs?: number;
  enabled?: boolean;
  useVisualViewport?: boolean;
}

interface WindowSizeSubscription {
  listener: () => void;
  debounceMs: number;
  throttleMs: number;
  useVisualViewport: boolean;
  timeoutId: ReturnType<typeof setTimeout> | null;
  lastNotifiedAt: number | null;
  disposed: boolean;
}

const subscriptions = new Set<WindowSizeSubscription>();

let currentSnapshot: WindowSizeStoreSnapshot | null = null;
let listeningToWindow = false;
let visualViewportTarget: VisualViewport | null = null;

function normalizeDelay(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function hasVisualViewportSubscribers(): boolean {
  for (const subscription of subscriptions) {
    if (subscription.useVisualViewport) {
      return true;
    }
  }

  return false;
}

function clearSubscriptionTimer(subscription: WindowSizeSubscription): void {
  if (subscription.timeoutId === null) {
    return;
  }

  clearTimeout(subscription.timeoutId);
  subscription.timeoutId = null;
}

function notifySubscription(subscription: WindowSizeSubscription): void {
  if (subscription.disposed) {
    return;
  }

  subscription.lastNotifiedAt = Date.now();
  subscription.listener();
}

function scheduleSubscriptionNotification(subscription: WindowSizeSubscription): void {
  if (subscription.debounceMs > 0) {
    clearSubscriptionTimer(subscription);
    subscription.timeoutId = setTimeout(() => {
      subscription.timeoutId = null;
      notifySubscription(subscription);
    }, subscription.debounceMs);
    return;
  }

  if (subscription.throttleMs > 0) {
    const now = Date.now();
    const lastNotifiedAt = subscription.lastNotifiedAt;

    if (lastNotifiedAt === null || now - lastNotifiedAt >= subscription.throttleMs) {
      clearSubscriptionTimer(subscription);
      notifySubscription(subscription);
      return;
    }

    if (subscription.timeoutId === null) {
      subscription.timeoutId = setTimeout(
        () => {
          subscription.timeoutId = null;
          notifySubscription(subscription);
        },
        subscription.throttleMs - (now - lastNotifiedAt),
      );
    }
    return;
  }

  notifySubscription(subscription);
}

function handleWindowSizeChange(): void {
  const previousSnapshot = currentSnapshot;
  const nextSnapshot = getWindowSizeStoreSnapshot();

  if (previousSnapshot !== null && Object.is(previousSnapshot, nextSnapshot)) {
    return;
  }

  subscriptions.forEach((subscription) => {
    scheduleSubscriptionNotification(subscription);
  });
}

function ensureVisualViewportListener(): void {
  if (!isWindowSizeBrowser()) {
    return;
  }

  const nextTarget =
    subscriptions.size > 0 && hasVisualViewportSubscribers()
      ? (window.visualViewport ?? null)
      : null;

  if (visualViewportTarget !== null && visualViewportTarget !== nextTarget) {
    visualViewportTarget.removeEventListener("resize", handleWindowSizeChange);
    visualViewportTarget = null;
  }

  if (visualViewportTarget === null && nextTarget !== null) {
    nextTarget.addEventListener("resize", handleWindowSizeChange);
    visualViewportTarget = nextTarget;
  }
}

function ensureWindowListeners(): void {
  if (!isWindowSizeBrowser()) {
    return;
  }

  const shouldListenToWindow = subscriptions.size > 0;

  if (shouldListenToWindow && !listeningToWindow) {
    window.addEventListener("resize", handleWindowSizeChange);
    listeningToWindow = true;
  }

  if (!shouldListenToWindow && listeningToWindow) {
    window.removeEventListener("resize", handleWindowSizeChange);
    listeningToWindow = false;
  }

  ensureVisualViewportListener();
}

export function createWindowSizeStoreServerSnapshot(
  options: CreateWindowSizeStoreSnapshotOptions = {},
): WindowSizeStoreSnapshot {
  return createInitialWindowSizeStoreSnapshot(options);
}

export function getWindowSizeStoreSnapshot(): WindowSizeStoreSnapshot {
  const nextSnapshot = readWindowSizeStoreSnapshot();

  if (currentSnapshot !== null && areWindowSizeStoreSnapshotsEqual(currentSnapshot, nextSnapshot)) {
    return currentSnapshot;
  }

  currentSnapshot = nextSnapshot;
  return currentSnapshot;
}

export function subscribeToWindowSizeStore(
  listener: () => void,
  options: WindowSizeSubscriptionOptions = {},
): () => void {
  if (options.enabled === false || !isWindowSizeBrowser()) {
    return () => {};
  }

  const debounceMs = normalizeDelay(options.debounceMs);
  const subscription: WindowSizeSubscription = {
    listener,
    debounceMs,
    throttleMs: debounceMs > 0 ? 0 : normalizeDelay(options.throttleMs),
    useVisualViewport: options.useVisualViewport === true,
    timeoutId: null,
    lastNotifiedAt: null,
    disposed: false,
  };

  subscriptions.add(subscription);
  ensureWindowListeners();

  return () => {
    subscription.disposed = true;
    clearSubscriptionTimer(subscription);
    subscriptions.delete(subscription);
    ensureWindowListeners();
  };
}
