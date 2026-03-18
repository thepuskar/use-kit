import { useState } from "react";

import { useCopyToClipboard } from "./useCopyToClipboard";

export function CopyToClipboardDemo() {
  const [value, setValue] = useState("Sample text for clipboard!");
  const { copied, error, copy, reset } = useCopyToClipboard({
    resetTime: 3000,
  });

  async function handleCopy() {
    await copy(value);
  }

  return (
    <div>
      <input value={value} onChange={(event) => setValue(event.target.value)} />
      <button onClick={handleCopy}>{copied ? "Copied!" : "Copy to Clipboard"}</button>
      <button onClick={reset}>Reset</button>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>
  );
}
