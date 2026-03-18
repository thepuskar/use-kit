import { useArray } from "./useArray";

export const UseArrayDemo = () => {
  const { value, push, filter, move, removeValue, clear, reset, shuffle } = useArray([
    "apple",
    "banana",
    "cherry",
    "cheese",
    "cookie",
  ]);

  return (
    <div>
      <p>Array: {JSON.stringify(value)}</p>
      <button onClick={() => push("lemon")}>Push 'lemon'</button>
      <button onClick={() => filter((item) => item.startsWith("b"))}>Filter starts with 'b'</button>
      <button onClick={() => move(0, 2)}>Move first item to index 2</button>
      <button onClick={() => removeValue("cherry")}>Remove 'cherry'</button>
      <button onClick={clear}>Clear array</button>
      <button onClick={shuffle}>Shuffle array</button>
      <button onClick={reset}>Reset array</button>
    </div>
  );
};
