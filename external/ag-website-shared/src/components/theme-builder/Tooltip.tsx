import { Information } from '@carbon/icons-react';
import styled from '@emotion/styled';
import { FloatingPortal, arrow, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react';
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

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

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

const StyledTooltip = styled('div')`
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0) translateY(8px); // Merged transform
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0px); // Merged transform
        }
    }

    z-index: 100000;
    max-width: 400px;
    background: var(--color-bg-primary);
    padding: 8px;
    border-radius: 6px;
    border: solid 1px var(--color-border-primary);
    box-shadow: var(--shadow-md);
    font-size: 14px;
    color: var(--color-text-primary);
    animation-name: scaleIn;
    animation-duration: 0.3s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
`;

export type InfoTooltipProps = {
    title: ReactNode | null;
    className?: string;
};

export const InfoTooltip = ({ title, className }: InfoTooltipProps) => (
    <Tooltip title={title}>
        <StyledInformation className={className} />
    </Tooltip>
);

const StyledInformation = styled(Information)`
    margin-left: 4px;
    margin-bottom: 2px;
    width: 13px;
    height: 13px;
    box-sizing: content-box;
    border: solid 1px transparent;
    cursor: pointer;
`;
