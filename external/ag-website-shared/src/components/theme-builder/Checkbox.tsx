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

    &.is-disabled {
        opacity: 0.5;
    }
`;
