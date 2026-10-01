import { Information } from '@carbon/icons-react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import {
    FloatingPortal,
    arrow,
    flip,
    offset,
    shift,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
} from '@floating-ui/react';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, useRef, useState } from 'react';

export type TooltipProps = {
    title: ReactNode | null;
    children: ReactElement;
    suppressPortal?: boolean;
};

export const Tooltip = (props: TooltipProps) => (props.title ? <TooltipImpl {...props} /> : props.children);

const TooltipImpl = ({ title, children, suppressPortal }: TooltipProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'top',
        middleware: [
            offset(8),
            shift({ padding: 8 }),
            flip({ crossAxis: true, mainAxis: true }),
            arrow({
                element: arrowRef,
            }),
        ],
    });

    const hover = useHover(context);
    // Focus as well as hover, for a tooltip whose target can be reached by
    // keyboard - the docs link below. A target that cannot take focus, which is
    // every other one, never sees the difference.
    const focus = useFocus(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);

    const content = (
        <TooltipPopup ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <StyledTooltip>{title}</StyledTooltip>
        </TooltipPopup>
    );

    return (
        <>
            {cloneElement(children, { ref: refs.setReference, ...getReferenceProps() })}
            {isOpen && (suppressPortal ? content : <FloatingPortal>{content}</FloatingPortal>)}
        </>
    );
};

const TooltipPopup = styled('div')``;

// Through the helper, so the name is unique: an animation name written straight
// into a template literal is global, and would collide with any other `scaleIn`.
const scaleIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0) translateY(8px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0px);
    }
`;

const StyledTooltip = styled('div')`
    z-index: 100000;
    max-width: 400px;
    background: var(--color-bg-primary);
    padding: 8px;
    border-radius: 6px;
    border: solid 1px var(--color-border-primary);
    box-shadow: var(--shadow-md);
    font-size: 14px;
    color: var(--color-text-primary);
    animation-name: ${scaleIn};
    animation-duration: 0.3s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
`;

export type InfoTooltipProps = {
    title: ReactNode | null;
    /**
     * Where to read more, if anywhere. Given one, the icon becomes a link to it
     * and the tooltip says so - an icon that explains and an icon that also
     * opens a page look identical otherwise.
     */
    href?: string;
    /** What the link leads to, for its accessible name. */
    linkSubject?: string;
    className?: string;
};

export const InfoTooltip = ({ title, href, linkSubject, className }: InfoTooltipProps) => {
    const icon = <StyledInformation className={className} />;
    if (!href) {
        return <Tooltip title={title}>{icon}</Tooltip>;
    }
    return (
        <Tooltip
            title={
                <>
                    {title}
                    <DocsHint>Open the API reference</DocsHint>
                </>
            }
        >
            {/* A new tab, as the dialog's docs link does: the reader is mid-edit,
                and the point of the link is to read alongside the editor. */}
            <DocsLink
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={linkSubject ? `Open the API reference for ${linkSubject}` : 'Open the API reference'}
            >
                {icon}
            </DocsLink>
        </Tooltip>
    );
};

const DocsHint = styled('span')`
    display: block;
    margin-top: 4px;
    color: var(--color-fg-secondary);
    font-size: 12px;
`;

// Inline, and sized by the icon it wraps, so that wrapping the icon in a link
// does not change where the icon sits in its label.
const DocsLink = styled('a')`
    display: inline-flex;
    color: inherit;

    &:hover {
        color: inherit;
    }
`;

const StyledInformation = styled(Information)`
    margin-left: 4px;
    margin-bottom: 2px;
    width: 13px;
    height: 13px;
    box-sizing: content-box;
    border: solid 1px transparent;
    cursor: pointer;
`;
