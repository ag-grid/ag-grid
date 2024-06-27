import { useLocation } from '@ag-website-shared/utils/navigation';
import { scrollspy } from '@utils/scrollspy';
import type { MarkdownHeading } from 'astro';
import { useEffect, useRef } from 'react';

export function useScrollSpy({
    headings,
    offset = 120,
    delayedScrollSpy,
}: {
    headings: MarkdownHeading[];
    offset?: number;
    /**
     * Delay scroll spy running, so the UI has time to render
     */
    delayedScrollSpy?: boolean;
}) {
    const menuRef = useRef<HTMLElement>(null);
    const location = useLocation();

    function handleScrollSpy(slug: string) {
        if (menuRef.current == null) return;
        for (const navItem of menuRef.current.querySelectorAll('a')) {
            navItem.classList.toggle('active', navItem.getAttribute('href') === `#${slug}`);
        }
    }

    useEffect(() => {
        function runScrollSpy() {
            scrollspy(headings, handleScrollSpy, { offset });
        }
        if (delayedScrollSpy) {
            setTimeout(() => runScrollSpy(), 500);
        } else {
            runScrollSpy();
        }
    }, [location?.hash, headings, delayedScrollSpy]);

    return menuRef;
}
