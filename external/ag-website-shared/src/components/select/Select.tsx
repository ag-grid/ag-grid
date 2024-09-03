import { Checkmark, ChevronUp } from '@carbon/icons-react';
import * as RadixSelect from '@radix-ui/react-select';
import classnames from 'classnames';
import { ChevronDown } from 'lucide-react';
import { forwardRef, useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';

import styles from './Select.module.scss';

type SelectProps<O> = {
    options: O[];
    value: O;
    onChange: (newValue: O) => void;
    renderItem?: (item: O) => ReactNode;
    getKey?: (item: O) => string;
    getLabel?: (item: O) => string;
    getGroupLabel?: (item: O) => string;
    isPopper?: boolean;
    isLarge?: boolean;
};

export function Select<O>({
    value,
    options,
    onChange,
    renderItem,
    getKey = defaultGetKey,
    getLabel,
    getGroupLabel = defaultGetGroupLabel,
    isPopper,
    isLarge,
}: SelectProps<O>) {
    const getOptionContent = useCallback((option: O) => {
        const key = getKey(option) || '';
        let label: string | undefined = getLabel?.(option);
        if (label == null) {
            label = defaultGetLabel(option);
        }
        if (label == null) {
            label = key;
        }

        const optionContent = renderItem ? renderItem(option) : label || key;

        return {
            key,
            optionContent,
        };
    }, []);

    const optionsByValue = new Map<string, O>();
    const content: Record<string, ReactElement[]> = {};
    for (const option of options) {
        const group = getGroupLabel(option) || '';
        const { key, optionContent } = getOptionContent(option);
        content[group] ||= [];
        content[group].push(
            <SelectItem key={key} value={key} isLarge={isLarge}>
                {optionContent}
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
            <RadixSelect.Trigger
                tabIndex={0}
                aria-label="Framework selector"
                className={classnames(styles.trigger, { [styles.large]: isLarge })}
            >
                <RadixSelect.Value>{getOptionContent(value).optionContent}</RadixSelect.Value>
                <RadixSelect.Icon>
                    <ChevronDown className={styles.chevronDown} />
                </RadixSelect.Icon>
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
                <RadixSelect.Content
                    position={isPopper ? 'popper' : 'item-aligned'}
                    className={classnames(styles.content, {
                        [styles.popper]: isPopper,
                        [styles.large]: isLarge,
                    })}
                >
                    <RadixSelect.ScrollUpButton className="SelectScrollButton">
                        <ChevronUp />
                    </RadixSelect.ScrollUpButton>
                    <RadixSelect.Viewport>
                        {Object.entries(content).map(([groupLabel, items]) => (
                            <RadixSelect.Group key={groupLabel}>
                                {groupLabel && (
                                    <RadixSelect.Label className={styles.label}>{groupLabel}</RadixSelect.Label>
                                )}
                                {items}
                            </RadixSelect.Group>
                        ))}
                    </RadixSelect.Viewport>
                    <RadixSelect.ScrollDownButton className="SelectScrollButton">
                        <ChevronDown className={styles.chevronDown} />
                    </RadixSelect.ScrollDownButton>
                </RadixSelect.Content>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
}

const defaultGetKey = (option: any): string => {
    if (typeof option === 'string') return option;
    const valueProperty = option?.value;
    if (typeof valueProperty === 'string' || typeof valueProperty === 'number') {
        return String(valueProperty);
    }
    throw new Error('option.value must be a string or getKey must be provided');
};

const defaultGetLabel = (option: any): string | undefined => {
    const label = option?.label;
    return typeof label === 'string' ? label : undefined;
};

const defaultGetGroupLabel = (option: any) => option?.groupLabel;

const SelectItem = forwardRef(({ children, className, isLarge, ...props }: any, forwardedRef) => {
    return (
        <RadixSelect.Item
            className={classnames(styles.item, className, {
                [styles.large]: isLarge,
            })}
            {...props}
            ref={forwardedRef}
        >
            <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
            <RadixSelect.ItemIndicator>
                <Checkmark />
            </RadixSelect.ItemIndicator>
        </RadixSelect.Item>
    );
});
