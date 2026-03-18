import { useState } from "react";

import { useClickOutside } from "./useClickOutside";

export const UseClickOutsideDemo = () => {
  const [open, setOpen] = useState(true);
  const ref = useClickOutside<HTMLDivElement>(
    () => {
      setOpen(false);
    },
    {
      events: ["pointerdown"],
      disabled: !open,
    },
  );

  return (
    <div>
      <button onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Open"}</button>
      {open ? <div ref={ref}>Click outside this element to close it.</div> : null}
    </div>
  );
};
