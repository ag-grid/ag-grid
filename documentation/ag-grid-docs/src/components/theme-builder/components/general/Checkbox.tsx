import styled from '@emotion/styled';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { combineClassNames } from '../component-utils';

export type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: ReactNode;
    disabled?: boolean;
    className?: string;
};

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
    ({ checked, onChange, children, disabled, className }, ref) => (
        <Container ref={ref} className={combineClassNames(className, disabled && 'is-disabled')}>
            <span className="text-tertiary">off</span>
            <input
                type="checkbox"
                className="switch"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="text-tertiary">on</span>
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
