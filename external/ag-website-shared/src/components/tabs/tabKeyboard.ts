/**
 * The tab a key moves to in a horizontal WAI-ARIA tab list, or `undefined` for keys it leaves to the browser.
 */
export function getTabIndexForKey(key: string, currentIndex: number, count: number): number | undefined {
    switch (key) {
        case 'ArrowRight':
            return (currentIndex + 1) % count;
        case 'ArrowLeft':
            return (currentIndex - 1 + count) % count;
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        default:
            return undefined;
    }
}
