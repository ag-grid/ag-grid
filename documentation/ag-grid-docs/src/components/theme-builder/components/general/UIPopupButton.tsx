import styled from '@emotion/styled';
import { type UseFloatingOptions, autoUpdate, shift, useFloating } from '@floating-ui/react';
import { type ReactNode, useState } from 'react';

import { combineClassNames, useClickAwayListener } from '../component-utils';
import { Card } from './Card';

export type UIPopupButtonProps = {
    dropdownContent: ReactNode;
    children: ReactNode;
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary';
};

/**
 * A version of MUI's menu component that can contain interactive UI in the dropdown. It doesn't close until you click outside the dropdown.
 */
export const UIPopupButton = (props: UIPopupButtonProps) => {
    const { refs, floatingStyles, elements } = useFloating(floatingOptions);
    const [show, setShow] = useState(false);

    useClickAwayListener(() => setShow(false), [elements.domReference, elements.floating]);

    return (
        <>
            <Button
                className={combineClassNames(
                    props.className,
                    show && 'is-dropdown-visible',
                    `variant-${props.variant || 'secondary'}`
                )}
                onClick={() => setShow(!show)}
                ref={refs.setReference}
                color="neutral"
            >
                {props.startDecorator}
                {props.children}
                {props.endDecorator}
            </Button>
            {show && (
                <DropdownArea ref={refs.setFloating} style={floatingStyles}>
                    {props.dropdownContent}
                </DropdownArea>
            )}
        </>
    );
};

const floatingOptions: Partial<UseFloatingOptions> = {
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
    middleware: [shift({ padding: 8 })],
};

export const Button = styled('button')`
    width: 48px;
    height: 48px;
    border-radius: 48px;
    font-weight: 500;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0px 3.76px 3.76px 0px hsla(0, 0%, 0%, 0.06);

    &.variant-secondary {
        border: solid 1px var(--color-input-border);
        color: var(--color-fg-tertiary);
        background-color: var(--color-bg-primary);

        &:hover {
            color: var(--color-fg-primary);
            background-color: var(--color-bg-secondary);
        }
    }
`;

const DropdownArea = styled(Card)`
    z-index: 1000;
    position: absolute;
    pointer-events: all;
    max-height: calc(100vh - 16px);
    margin-left: 8px;
`;
