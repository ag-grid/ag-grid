import { Checkmark, ChevronUp } from '@carbon/icons-react';
import styled from '@emotion/styled';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { type ReactElement, type ReactNode, forwardRef } from 'react';

import {
    SharedContent,
    SharedIndicator,
    SharedItem,
    SharedTrigger,
} from '../../../../../documentation/ag-grid-docs/src/components/theme-builder/components/editors/dropdown-shared';

type SelectProps<O> = {
    options: O[];
    value: O;
    onChange: (newValue: O) => void;
    renderItem?: (item: O) => ReactNode;
    getKey?: (item: O) => string;
    getLabel?: (item: O) => string;
    getGroupLabel?: (item: O) => string;
};

export function Select<O>({
    value,
    options,
    onChange,
    renderItem,
    getKey = defaultGetKey,
    getLabel = defaultGetLabel,
    getGroupLabel = defaultGetGroupLabel,
}: SelectProps<O>) {
    const optionsByValue = new Map<string, O>();
    const content: Record<string, ReactElement[]> = {};
    for (const option of options) {
        const group = getGroupLabel(option) || '';
        const key = getKey(option) || '';
        const label = getLabel(option) || '';
        content[group] ||= [];
        content[group].push(
            <SelectItem key={key} value={key}>
                {renderItem ? renderItem(option) : label || key}
            </SelectItem>
        );
        optionsByValue.set(key, option);
    }

    return (
        <RadixSelect.Root
            value={getKey(value)}
            onValueChange={(newValue) => {
                const chosen = optionsByValue.get(newValue);
                if (chosen) {
                    onChange(chosen);
                }
            }}
        >
            <StyledTrigger tabIndex={0}>
                <RadixSelect.Value placeholder="Choose..." />
                <RadixSelect.Icon>
                    <StyledChevronDown />
                </RadixSelect.Icon>
            </StyledTrigger>
            <RadixSelect.Portal>
                <StyledContent>
                    <RadixSelect.ScrollUpButton className="SelectScrollButton">
                        <ChevronUp />
                    </RadixSelect.ScrollUpButton>
                    <StyledSelectViewport>
                        {Object.entries(content).map(([groupLabel, items]) => (
                            <RadixSelect.Group key={groupLabel}>
                                {groupLabel && <StyledSelectLabel>{groupLabel}</StyledSelectLabel>}
                                {items}
                            </RadixSelect.Group>
                        ))}
                    </StyledSelectViewport>
                    <RadixSelect.ScrollDownButton className="SelectScrollButton">
                        <StyledChevronDown />
                    </RadixSelect.ScrollDownButton>
                </StyledContent>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
}

const defaultGetKey = (option: any) => {
    const valueProperty = option?.value;
    if (typeof valueProperty !== 'string') {
        throw new Error('option.value must be a string or getOptionValue must be provided');
    }
    return valueProperty;
};

const defaultGetLabel = (option: any) => option?.label || 'undefined';

const defaultGetGroupLabel = (option: any) => option?.groupLabel;

const SelectItem = forwardRef(({ children, className, ...props }: any, forwardedRef) => {
    return (
        <StyledSelectItem className={className} {...props} ref={forwardedRef}>
            <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
            <StyledSelectItemIndicator>
                <Checkmark />
            </StyledSelectItemIndicator>
        </StyledSelectItem>
    );
});

const StyledTrigger = SharedTrigger.withComponent(RadixSelect.Trigger);

const StyledChevronDown = styled(ChevronDown)`
    opacity: 0.5;
    height: 16px;
    width: 16px;
`;

const StyledContent = SharedContent.withComponent(RadixSelect.Content);

const StyledSelectViewport = styled(RadixSelect.Viewport)``;

const StyledSelectItem = SharedItem.withComponent(RadixSelect.Item);

const StyledSelectLabel = styled(RadixSelect.Label)`
    padding: 0 12px;
    font-size: 14px;
    line-height: 25px;
    font-weight: 600;
    color: var(--mauve-11);
`;

const StyledSelectItemIndicator = SharedIndicator.withComponent(RadixSelect.ItemIndicator);
