import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay.
 * Useful for search inputs to avoid firing requests on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 */
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timer if value changes before delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
