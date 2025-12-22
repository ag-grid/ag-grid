import { useEffect, useLayoutEffect } from 'react';

/**
 * Allow `useLayoutEffect` to be used on the server side without warnings
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
