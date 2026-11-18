import { Close } from '@carbon/icons-react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { InfoTooltip } from './Tooltip';

export type FormFieldProps = {
    label?: string | null;
    docs?: string | null;
    /** Where the docs are published, if the host has a page to link to. */
    docsUrl?: string | null;
    /**
     * A footnote under the control - a line saying where the value came from,
     * say. Nothing by default.
     */
    note?: ReactNode;
    /** A control at the end of the label row, such as an on/off switch. */
    labelControl?: ReactNode;
    /** An icon before the label, picturing what the field styles. */
    labelIcon?: ReactNode;
    children?: ReactNode;
    onCloseClick?: () => void;
};

export const FormField = ({
    label,
    children,
    docs,
    docsUrl,
    note,
    labelControl,
    labelIcon,
    onCloseClick,
}: FormFieldProps) => (
    <StyledFormField className={labelControl ? 'is-group' : undefined}>
        {(label || docs || docsUrl || labelControl || onCloseClick) && (
            <LabelRow>
                <Label>
                    {labelIcon && <LabelIcon>{labelIcon}</LabelIcon>}
                    {label}
                    {(docs || docsUrl) && (
                        <InfoTooltip
                            title={docs || null}
                            href={docsUrl ?? undefined}
                            linkSubject={label ?? undefined}
                        />
                    )}
                    {onCloseClick && <CloseButton onClick={onCloseClick} />}
                </Label>
                {labelControl}
            </LabelRow>
        )}
        {children}
        {note}
    </StyledFormField>
);

const StyledFormField = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 6px;

    // A switch in the label row turns the field into a card tying its inputs to their heading.
    &.is-group {
        gap: 12px;
        padding: 8px 10px;
        border: 1px solid var(--color-border-secondary);
        border-radius: 8px;
        background-color: color-mix(in srgb, var(--color-fg-primary) 3%, transparent);
    }
`;

const LabelRow = styled('div')`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Label = styled('span')`
    flex: 1;
    color: var(--color-fg-secondary);
    opacity: 0.8;
    font-size: 12px;
    font-weight: 400;
    transition: all 0.3s;
    display: flex;
    align-items: center;

    svg:hover path {
        fill: var(--color-fg-primary);
    }

    .is-group > * > & {
        color: var(--color-fg-primary);
        opacity: 1;
        font-size: 13px;
        font-weight: 500;
    }
`;

const LabelIcon = styled('span')`
    display: flex;
    flex-shrink: 0;
    margin-right: 6px;
`;

const CloseButton = styled(Close)`
    cursor: pointer;
    margin-left: auto;
`;
