import { Checkmark, ChevronUp } from '@carbon/icons-react';
import styled from '@emotion/styled';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { type ReactElement, forwardRef } from 'react';

import { SharedContent, SharedIndicator, SharedItem, SharedTrigger } from './dropdown-shared';

type SelectOption = {
    value: string;
    label?: string;
    groupLabel?: string;
};

type SelectProps<O> = {
    value: O;
    onChange: (value: O) => void;
    options: O[];
};

export function Select<O extends SelectOption>({ value, options, onChange }: SelectProps<O>) {
    const optionsByValue = new Map<string, O>();
    const content: Record<string, ReactElement[]> = {};
    for (const option of options) {
        const group = option.groupLabel || '';
        content[group] ||= [];
        content[group].push(
            <SelectItem key={option.value} value={option.value}>
                {option.label || option.value}
            </SelectItem>
        );
        optionsByValue.set(option.value, option);
    }

    return (
        <RadixSelect.Root
            value={value.value}
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
