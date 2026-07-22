import styled from '@emotion/styled';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export type PresetScrollerProps = {
    children: ReactNode;
};

/**
 * Horizontal scroll-snap strip for preset thumbnails, with fade edges that
 * only show while there's more content to scroll to in that direction.
 * Contents are entirely up to the caller - render one PresetButton (or any
 * other element) per preset as a child.
 */
export function PresetScroller({ children }: PresetScrollerProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            ro.disconnect();
        };
    }, [updateScrollState]);

    return (
        <Wrapper>
            <Scroller ref={scrollerRef}>
                <Horizontal>{children}</Horizontal>
            </Scroller>
            {canScrollLeft && <ScrollFade className="fade-left" aria-hidden="true" />}
            {canScrollRight && <ScrollFade className="fade-right" aria-hidden="true" />}
        </Wrapper>
    );
}

/**
 * Shared button chrome for one preset in a PresetScroller - sizing, spacing,
 * scroll-snap alignment, and focus/hover states. Render whatever thumbnail
 * content makes sense for the host as children.
 */
export const PresetButton = styled('button')`
    border: solid 2px transparent !important;
    background: none !important;
    display: inline-block;
    text-align: left;
    margin: 0 12px 8px 0;
    padding: 0;
    scroll-snap-align: center;

    // Higher z index than blur container z index
    &:first-of-type,
    &:last-of-type {
        z-index: 3;
    }

    &:focus-visible {
        outline: none;
        box-shadow: none;
        border-color: var(--color-brand-500);
    }
`;

// min-height lives on the outermost element deliberately: it's the direct
// flex item of the theme builder's Main layout, so its used height (even
// though only a min-height is specified) is treated as definite by the flex
// algorithm - which is what lets the height: 100% chain below (Scroller ->
// Horizontal -> preset button -> live grid preview) resolve to a real size
// instead of collapsing to 0. Nesting an extra plain block between this and
// Main would break that.
const Wrapper = styled('div')`
    --scroller-height: 192px;

    position: relative;
    width: 100%;
    min-height: var(--scroller-height);
`;

const Horizontal = styled('div')`
    display: flex;
    height: 100%;
    isolation: isolate;
`;

const Scroller = styled('div')`
    width: 100%;
    height: 100%;
    overflow-x: auto;
    padding-bottom: 6px;
    z-index: 0; // z-index:0 prevents a Safari rendering bug where scrollbars appear over tooltips
    scroll-snap-type: x mandatory;
`;

const ScrollFade = styled('div')`
    position: absolute;
    top: 0;
    bottom: 14px;
    pointer-events: none;
    z-index: 2;

    &.fade-left {
        width: 100px;
        left: 0;
        background: linear-gradient(
            to right,
            var(--color-bg-primary),
            color-mix(in srgb, var(--color-bg-primary), transparent 88%) 80%,
            transparent
        );
    }

    &.fade-right {
        width: 128px;
        right: 0;
        background: linear-gradient(
            to left,
            var(--color-bg-primary),
            color-mix(in srgb, var(--color-bg-primary), transparent 33%) 50%,
            transparent
        );
    }
`;
