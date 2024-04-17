import type { PartId } from '@ag-grid-community/theming';
import type { ReactNode } from 'react';

import { PartModel, useSelectedVariant } from '../../model/PartModel';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';

export type VariantSelectorProps = {
    part: PartId;
};

export const PartEditor = withErrorBoundary((props: VariantSelectorProps) => {
    const part = PartModel.for(props.part);
    const [variant, setVariant] = useSelectedVariant(part);
    return (
        <FormField label={part.label} docs={part.docs}>
            <TmpSelect
                options={part.variants.filter((v) => v.variantId !== 'base')}
                value={variant}
                onChange={setVariant}
            />
        </FormField>
    );
});

type TmpSelectProps<T extends {}> = {
    value: T | null | undefined;
    onChange?: (newValue: T) => void;
    options: T[];
    getLabel?: (option: T) => string;
    getGroupLabel?: (option: T) => string;
};

function TmpSelect<T extends {}>({
    options,
    value,
    onChange,
    getLabel = defaultGetLabel,
    getGroupLabel,
}: TmpSelectProps<T>) {
    const currentStringValue = value != null ? getLabel(value) : null;
    let hasValue = false;

    const optionSpecs = options.map((option) => {
        const stringValue = getLabel(option);
        if (stringValue === currentStringValue) hasValue = true;
        return { stringValue, groupLabel: getGroupLabel?.(option) };
    });

    const children: ReactNode[] = [];
    let currentGroupLabel: string | undefined;
    let currentGroup = children;
    for (let i = 0; i < optionSpecs.length; i++) {
        const spec = optionSpecs[i];
        if (currentGroupLabel !== spec.groupLabel) {
            currentGroupLabel = spec.groupLabel;
            if (currentGroupLabel) {
                currentGroup = [];
                children.push(
                    <optgroup key={i} label={currentGroupLabel}>
                        {currentGroup}
                    </optgroup>
                );
            } else {
                currentGroup = children;
            }
        }
        currentGroup.push(<option key={i}>{spec.stringValue}</option>);
    }

    return (
        <select
            value={currentStringValue || ''}
            onChange={(e) => {
                const selectedT = options.find((t) => getLabel(t) === e.target.value);
                if (selectedT) {
                    onChange?.(selectedT);
                }
            }}
        >
            {!hasValue && (
                <option value={currentStringValue || ''} selected={true}>
                    {currentStringValue || 'choose...'}
                </option>
            )}
            {children}
        </select>
    );
}

const defaultGetLabel = (option: any) => (typeof option?.label === 'string' ? option.label : String(option));
