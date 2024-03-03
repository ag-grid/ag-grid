import type { MarkdownHeading } from 'astro';

interface ScrollSpyOptions {
    container?: Element;
    offset?: number;
}

export function scrollspy(
    headings: MarkdownHeading[],
    handler: (slug: string) => void,
    { container, offset }: ScrollSpyOptions = {}
) {
    const entries = headings
        .map<[string, HTMLElement | null]>(({ slug }) => [slug, document.getElementById(slug)])
        .filter(<T>(entry: [string, T]): entry is [string, NonNullable<T>] => entry[1] != null);

    function spyHandler() {
        const { scrollTop, scrollHeight, clientHeight } = container ?? document.documentElement;

        let selectedSlug: string | undefined;
        let lastOffsetTop: number | undefined;

        for (const [slug, node] of entries) {
            // don't break if we reached the bottom of the scroll container
            if (node.offsetTop > scrollTop + (offset ?? 0) && scrollTop + clientHeight < scrollHeight) {
                break;
            }
            // duplicate node's offsetTop indicates multiple tab headings
            if (node.offsetTop !== lastOffsetTop || node.querySelector('button.active')) {
                selectedSlug = slug;
                lastOffsetTop = node.offsetTop;
            }
        }

        handler(selectedSlug ?? entries[0][0]);
    }

    spyHandler();

    const eventTarget = container ?? window;
    eventTarget.addEventListener('scroll', spyHandler);
    return () => eventTarget.removeEventListener('scroll', spyHandler);
}
