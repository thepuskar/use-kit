import React, { ComponentProps, ElementType, ReactNode } from "react";

/**
 * Props for the For component
 * @template T - The type of items in the data array
 * @template E - The element type for the wrapper component
 */
interface ForProps<T, E extends ElementType = "div"> {
  /** The array of data to iterate over */
  each: T[];

  /** Render function that returns a React node for each item */
  children: (item: T, index: number, array: T[]) => ReactNode;

  /** Optional key extractor function */
  getKey?: (item: T, index: number) => string | number;

  /** Optional empty state renderer when the array is empty */
  empty?: () => ReactNode;

  /** Optional loading state renderer */
  loading?: () => ReactNode;

  /** Boolean to indicate if data is loading */
  isLoading?: boolean;

  /** Optional wrapper component or element */
  as?: E;

  /** Optional props to pass to the wrapper element */
  wrapperProps?: Omit<ComponentProps<E>, "children">;
}

/**
 * A flexible component that works like Array.map() but with React-specific optimizations
 */
function For<T, E extends ElementType = "div">({
  each,
  children,
  getKey,
  empty,
  loading,
  isLoading = false,
  as,
  wrapperProps = {} as Omit<ComponentProps<E>, "children">,
}: ForProps<T, E>) {
  // Handle loading state
  if (isLoading && loading) {
    return <>{loading()}</>;
  }

  // Handle empty case
  if (each.length === 0 && empty) {
    return <>{empty()}</>;
  }

  // Render the items
  const items = each.map((item, index, array) => {
    const key = getKey ? getKey(item, index) : index;
    return (
      <React.Fragment key={key}>{children(item, index, array)}</React.Fragment>
    );
  });

  // Return with or without wrapper
  if (as) {
    const Component = as;
    return React.createElement(Component, wrapperProps, items);
  }

  return <>{items}</>;
}

export default For;
