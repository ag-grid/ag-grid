import { useEffect, useRef } from 'react';

/**
 * Calls onHide when the user interacts (mouse or touch) outside all of
 * ignoreElements - e.g. a reference element and a portalled popover that
 * together make up one logical control.
 */
export const useClickAwayListener = (onHide: () => void, ignoreElements: Array<Element | null | undefined>) => {
    const ignoreElementsRef = useRef(ignoreElements);
    ignoreElementsRef.current = ignoreElements;

    const ignore = useRef(false);

    useEffect(() => {
        const handleStart = (event: Event) => {
            ignore.current = ignoreElementsRef.current.some((el) => el?.contains(event.target as Node));
        };
        const handleEnd = () => {
            if (!ignore.current) {
                onHide();
            }
        };

        document.addEventListener('mousedown', handleStart);
        document.addEventListener('touchstart', handleStart);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);

        return () => {
            document.removeEventListener('mousedown', handleStart);
            document.removeEventListener('touchstart', handleStart);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [onHide]);
};
