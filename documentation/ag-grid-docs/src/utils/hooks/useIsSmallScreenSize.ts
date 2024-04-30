import { useLayoutEffect, useState } from 'react';

export function useIsSmallScreenSize(lessThanSize: number) {
    const [isSmallScreenSize, setIsSmallScreenSize] = useState(false);

    useLayoutEffect(() => {
        const updateIsScreenSize = () => {
            setIsSmallScreenSize(document.body.clientWidth < lessThanSize);
        };

        addEventListener('resize', updateIsScreenSize);
        updateIsScreenSize();

        return () => {
            removeEventListener('resize', updateIsScreenSize);
        };
    }, [lessThanSize]);

    return isSmallScreenSize;
}
