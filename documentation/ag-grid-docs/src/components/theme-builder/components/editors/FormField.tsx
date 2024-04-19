import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { InfoTooltip } from '../general/Tooltip';

export type FormFieldProps = {
    label?: string | null;
    docs?: string | null;
    children?: ReactNode;
};

export const FormField = ({ label, children, docs }: FormFieldProps) => (
    <StyledFormField>
        {(label || docs) && (
            <Label>
                {label}
                {docs && <InfoTooltip title={docs} />}
            </Label>
        )}
        {children}
    </StyledFormField>
);

const StyledFormField = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled('span')`
    color: var(--color-fg-secondary);
    opacity: 0.8;
    font-size: 12px;
    font-weight: 400;
    transition: all 0.3s;

    &:hover {
        svg path {
            fill: var(--color-fg-primary);
            transition: all 0.3s;
        }
    }
`;
