import { Information } from '@carbon/icons-react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { Tooltip } from '../general/Tooltip';

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
                {docs && (
                    <Tooltip title={docs}>
                        <StyledInformation />
                    </Tooltip>
                )}
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

const StyledInformation = styled(Information)`
    margin-left: 12px;
    margin-bottom: 2px;
    width: 13px;
    height: 13px;
`;

const Label = styled('span')`
    color: var(--color-fg-quinary);
    font-size: 14px;
    font-weight: 500;
`;
