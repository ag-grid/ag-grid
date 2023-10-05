import { useEffect, useRef } from 'react';

export const useFocusInput = <T extends HTMLElement>(focus: boolean | undefined) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, [focus]);
  return ref;
};
