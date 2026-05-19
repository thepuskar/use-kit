export interface MediaQuerySnapshot {
  matches: boolean;
  supported: boolean;
}

interface MediaQueryRecord {
  query: string;
  mediaQueryList: MediaQueryList | null;
  snapshot: MediaQuerySnapshot;
  listeners: Set<() => void>;
  removeChangeListener: (() => void) | null;
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

const supportedTrueSnapshot: MediaQuerySnapshot = {
  matches: true,
  supported: true,
};

const supportedFalseSnapshot: MediaQuerySnapshot = {
  matches: false,
  supported: true,
};

const fallbackTrueSnapshot: MediaQuerySnapshot = {
  matches: true,
  supported: false,
};

const fallbackFalseSnapshot: MediaQuerySnapshot = {
  matches: false,
  supported: false,
};

const mediaQueryRecords = new Map<string, MediaQueryRecord>();

export function getFallbackSnapshot(matches: boolean): MediaQuerySnapshot {
  return matches ? fallbackTrueSnapshot : fallbackFalseSnapshot;
}

function getSupportedSnapshot(matches: boolean): MediaQuerySnapshot {
  return matches ? supportedTrueSnapshot : supportedFalseSnapshot;
}

export function isMatchMediaSupported(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function getMediaQueryList(query: string): MediaQueryList | null {
  if (!isMatchMediaSupported()) {
    return null;
  }

  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

function createMediaQueryRecord(query: string): MediaQueryRecord {
  const mediaQueryList = getMediaQueryList(query);

  return {
    query,
    mediaQueryList,
    snapshot: mediaQueryList ? getSupportedSnapshot(mediaQueryList.matches) : fallbackFalseSnapshot,
    listeners: new Set(),
    removeChangeListener: null,
  };
}

function getMediaQueryRecord(query: string): MediaQueryRecord {
  let record = mediaQueryRecords.get(query);

  if (!record) {
    record = createMediaQueryRecord(query);
    mediaQueryRecords.set(query, record);
  }

  return record;
}

function ensureMediaQueryList(record: MediaQueryRecord): void {
  if (record.mediaQueryList !== null) {
    return;
  }

  const mediaQueryList = getMediaQueryList(record.query);

  if (mediaQueryList === null) {
    return;
  }

  record.mediaQueryList = mediaQueryList;
  record.snapshot = getSupportedSnapshot(mediaQueryList.matches);
}

function updateRecordSnapshot(record: MediaQueryRecord): boolean {
  ensureMediaQueryList(record);

  const nextSnapshot =
    record.mediaQueryList === null
      ? fallbackFalseSnapshot
      : getSupportedSnapshot(record.mediaQueryList.matches);

  if (Object.is(record.snapshot, nextSnapshot)) {
    return false;
  }

  record.snapshot = nextSnapshot;
  return true;
}

function notifyRecordListeners(record: MediaQueryRecord): void {
  if (!updateRecordSnapshot(record)) {
    return;
  }

  record.listeners.forEach((listener) => {
    listener();
  });
}

function addMediaQueryListListener(
  mediaQueryList: LegacyMediaQueryList,
  listener: (event: MediaQueryListEvent) => void,
): () => void {
  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", listener);

    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }

  if (typeof mediaQueryList.addListener === "function") {
    mediaQueryList.addListener(listener);

    return () => {
      mediaQueryList.removeListener?.(listener);
    };
  }

  return () => {};
}

function ensureChangeListener(record: MediaQueryRecord): void {
  if (record.removeChangeListener !== null || record.mediaQueryList === null) {
    return;
  }

  const listener = () => {
    notifyRecordListeners(record);
  };

  record.removeChangeListener = addMediaQueryListListener(record.mediaQueryList, listener);
}

export function getMediaQuerySnapshot(query: string): MediaQuerySnapshot {
  const record = getMediaQueryRecord(query);

  updateRecordSnapshot(record);
  return record.snapshot;
}

export function subscribeToMediaQuery(query: string, listener: () => void): () => void {
  const record = getMediaQueryRecord(query);

  ensureMediaQueryList(record);
  record.listeners.add(listener);
  ensureChangeListener(record);

  return () => {
    record.listeners.delete(listener);

    if (record.listeners.size > 0) {
      return;
    }

    record.removeChangeListener?.();
    record.removeChangeListener = null;
    mediaQueryRecords.delete(query);
  };
}

export function subscribeToMediaQueries(
  queries: readonly string[],
  listener: () => void,
): () => void {
  const uniqueQueries = Array.from(new Set(queries));
  const unsubscribers = uniqueQueries.map((query) => subscribeToMediaQuery(query, listener));

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
  };
}
