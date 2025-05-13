import { type MutableRefObject, useEffect } from 'react';

export interface UseIntersectionObserverParams {
    elementRef: MutableRefObject<HTMLElement | null>;
    onChange: (params: { isIntersecting: boolean; disconnect: () => void }) => void;
    threshold?: number;
    isDisabled?: boolean;
}

const DEFAULT_THRESHOLD = 0.2;

export function useIntersectionObserver({
    elementRef,
    onChange,
    threshold = DEFAULT_THRESHOLD,
    isDisabled,
}: UseIntersectionObserverParams) {
    useEffect(() => {
        if (!window || !elementRef.current || isDisabled) {
            return;
        }

        const observer = new window.IntersectionObserver(
            ([entry]) => onChange({ isIntersecting: entry.isIntersecting, disconnect: () => observer.disconnect() }),
            {
                root: null,
                threshold,
            }
        );
        observer.observe(elementRef.current);

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [elementRef.current]);
}
