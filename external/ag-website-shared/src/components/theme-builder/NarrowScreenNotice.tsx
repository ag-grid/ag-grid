import styled from '@emotion/styled';
import type { ReactNode } from 'react';

/**
 * Narrowest viewport the builder's two-pane layout is usable in. A host's root
 * container and this notice must both key off it, or a width falling between
 * the two renders neither and the page comes up blank.
 */
export const BUILDER_MIN_WIDTH = 900;

/** Children say what the host's builder offers, the heading being the same for every product. */
export const NarrowScreenNotice = ({ children }: { children: ReactNode }) => (
    <Notice>
        <Heading>Sorry, Theme Builder isn't available on smaller devices</Heading>
        <Body>{children}</Body>
    </Notice>
);

const Notice = styled('div')`
    display: none;

    @media screen and (max-width: ${BUILDER_MIN_WIDTH - 1}px) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - var(--layout-site-header-height, 64px));
        padding: 0 var(--layout-horizontal-margins);
        box-sizing: border-box;
        text-align: center;
    }
`;

const Heading = styled('h2')`
    margin-bottom: 8px;
    color: var(--color-fg-secondary);
`;

const Body = styled('p')`
    max-width: 30em;
    line-height: 1.5;
`;
