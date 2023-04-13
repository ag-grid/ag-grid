import { MutableRefObject, useEffect } from 'react';

export interface UseIntersectionObserverParams {
    elementRef: MutableRefObject<HTMLElement>;
    onChange: (params: { isIntersecting: boolean }) => void;
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
            ([entry]) => onChange({ isIntersecting: entry.isIntersecting }),
            {
                root: null,
                threshold,
            }
        );
        observer.observe(elementRef.current);

        return () => {
            observer.unobserve(elementRef.current);
        };
    }, [elementRef.current]);
}
