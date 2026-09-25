import styled from '@emotion/styled';
import classnames from 'classnames';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: ReactNode;
    disabled?: boolean;
    className?: string;
    useSwitch?: boolean;
};

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
    ({ checked, onChange, children, disabled, className, useSwitch }, ref) => (
        <Container ref={ref} className={classnames(className, { 'is-disabled': disabled })}>
            {useSwitch && <span className="text-tertiary">off</span>}
            <input
                type="checkbox"
                className={useSwitch ? 'switch' : undefined}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            {useSwitch && <span className="text-tertiary">on</span>}
            {children}
        </Container>
    )
);

const Container = styled('label')`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;

    // The box is a fixed square, but a flex item shrinks by default, and the
    // share it takes of a row's overflow is proportional to how far the label
    // overruns - so a label long enough to wrap leaves a tall thin sliver where
    // the box should be, and the longer the label the thinner the sliver.
    input {
        flex-shrink: 0;
    }

    &.is-disabled {
        opacity: 0.5;
    }
`;
