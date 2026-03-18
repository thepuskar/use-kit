import { useState } from "react";

import { useMutation } from "./useMutation";

export function UseMutationDemo() {
  const [name, setName] = useState("");
  const { data, error, isPending, mutate, reset } = useMutation(async (nextName: string = "") => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (nextName.trim().length < 3) {
      throw new Error("Name must be at least 3 characters.");
    }

    return {
      name: nextName.trim(),
    };
  });

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="button" onClick={() => mutate(name)}>
        Save
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      <p>{isPending ? "Saving..." : data ? `Saved: ${data.name}` : "Nothing saved yet"}</p>
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}
