import { useEffect, useState } from 'react';

interface Size {
    width: number;
    height: number;
}

const IS_SSR = typeof window === 'undefined';

export function useWindowSize(): Size {
    const [width, setWidth] = useState<number>(IS_SSR ? 0 : window.innerWidth);
    const [height, setHeight] = useState<number>(IS_SSR ? 0 : window.innerHeight);

    useEffect(() => {
        const onResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return {
        width,
        height,
    };
}
