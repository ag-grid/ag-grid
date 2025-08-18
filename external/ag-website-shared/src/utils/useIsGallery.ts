import { useEffect, useState } from 'react';

export function useIsGallery() {
    const [isGallery, setIsGallery] = useState<boolean>(false);
    useEffect(() => {
        setIsGallery(window.location.pathname.includes('/gallery/'));
    }, []);

    return isGallery;
}
