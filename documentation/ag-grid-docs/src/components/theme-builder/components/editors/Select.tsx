import { Checkmark, ChevronDown, ChevronUp } from '@carbon/icons-react';
import styled from '@emotion/styled';
import * as RadixSelect from '@radix-ui/react-select';
import { type ReactElement, forwardRef } from 'react';

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
                    <ChevronDown />
                </RadixSelect.Icon>
            </StyledTrigger>
            <RadixSelect.Portal>
                <StyledSelectContent>
                    <RadixSelect.ScrollUpButton>
                        <ChevronUp />
                    </RadixSelect.ScrollUpButton>
                    <StyledSelectViewport>
                        {Object.entries(content).map(([groupLabel, items]) => (
                            <RadixSelect.Group>
                                {groupLabel && <StyledSelectLabel>{groupLabel}</StyledSelectLabel>}
                                {items}
                            </RadixSelect.Group>
                        ))}
                    </StyledSelectViewport>
                    <RadixSelect.ScrollDownButton className="SelectScrollButton">
                        <ChevronDown />
                    </RadixSelect.ScrollDownButton>
                </StyledSelectContent>
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

const StyledTrigger = styled(RadixSelect.Trigger)`
    display: flex;
    align-items: center;
    border-radius: var(--radius-sm);
    font-weight: normal;
    height: 36px;
    gap: 6px;
    color: var(--color-fg-primary);
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-input-border);

    &:hover {
        color: var(--color-fg-primary);
        background-color: var(--color-bg-primary);
        border: 1px solid var(--color-input-border-hover);
    }
`;

const StyledSelectContent = styled(RadixSelect.Content)`
    position: absolute;
    overflow: hidden;
    background-color: white;
    border-radius: 6px;
    box-shadow:
        0px 10px 38px -10px rgba(22, 23, 24, 0.35),
        0px 10px 20px -15px rgba(22, 23, 24, 0.2);
    z-index: 1000;

    .SelectScrollButton {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 25px;
        color: var(--violet-11);
        cursor: default;
    }
`;

const StyledSelectViewport = styled(RadixSelect.Viewport)`
    padding: 5px;
`;

const StyledSelectItem = styled(RadixSelect.Item)`
    font-size: 14px;
    line-height: 1;
    color: var(--violet-11);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 24px;
    position: relative;
    user-select: none;
    cursor: pointer;

    &[data-disabled] {
        color: var(--mauve-8);
        pointer-events: none;
    }

    &[data-highlighted] {
        outline: none;
        background-color: rgba(0, 0, 0, 0.05);
    }
`;

const StyledSelectLabel = styled(RadixSelect.Label)`
    padding: 0 12px;
    font-size: 14px;
    line-height: 25px;
    font-weight: 600;
    color: var(--mauve-11);
`;

const StyledSelectItemIndicator = styled(RadixSelect.ItemIndicator)`
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;
