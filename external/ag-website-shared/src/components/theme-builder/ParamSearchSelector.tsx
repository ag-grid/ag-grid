import styled from '@emotion/styled';
import { FloatingPortal, autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import { useCombobox } from 'downshift';
import { Fragment, type ReactElement, type ReactNode, useRef, useState } from 'react';

import { StyledInput } from './Input';

export type ParamSearchSelectorProps<T> = {
    items: T[];
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    getDocs: (item: T) => string;
    isEnabled: (item: T) => boolean;
    onToggle: (item: T, enabled: boolean) => void;
    renderEnabledItem: (item: T) => ReactNode;
    placeholder?: string;
};

export function ParamSearchSelector<T>({
    items,
    getKey,
    getLabel,
    getDocs,
    isEnabled,
    onToggle,
    renderEnabledItem,
    placeholder = 'Search theme params...',
}: ParamSearchSelectorProps<T>) {
    const [filteredItems, setFilteredItems] = useState(items);
    const lastArrowKeyPressTime = useRef(0);

    const { isOpen, getMenuProps, getInputProps, getItemProps, inputValue } = useCombobox({
        onInputValueChange({ inputValue }) {
            setFilteredItems(getItemsMatchingFilter(items, inputValue, getLabel, getDocs, getKey));
        },
        items: filteredItems,
        itemToString(item) {
            return item ? getLabel(item) : '';
        },
        selectedItem: null,
        onSelectedItemChange: ({ selectedItem, type }) => {
            if (!selectedItem || type === useCombobox.stateChangeTypes.InputBlur) {
                return;
            }
            onToggle(selectedItem, !isEnabled(selectedItem));
        },
        onHighlightedIndexChange: ({ highlightedIndex }) => {
            const wasKeyboardNavigation = Date.now() - lastArrowKeyPressTime.current < 100;
            if (!wasKeyboardNavigation) {
                return;
            }
            const popup = refs.floating.current;
            const item = popup?.querySelector(`[data-param-index="${highlightedIndex}"]`);
            if (!popup || !item) {
                return;
            }
            const popupRect = popup.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            if (itemRect.top < popupRect.top) {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (itemRect.bottom > popupRect.bottom) {
                item.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        },

        stateReducer: (state, actionAndChanges) => {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
                case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
                    lastArrowKeyPressTime.current = Date.now();
                    return changes;
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true, // keep menu open after selection.
                        highlightedIndex: state.highlightedIndex,
                        inputValue: state.inputValue, // don't add the item string as input value at selection.
                    };
                case useCombobox.stateChangeTypes.InputBlur:
                    return {
                        ...changes,
                        inputValue: state.inputValue, // don't clear the input string on blur
                    };
                case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
                    return {
                        ...changes,
                        inputValue: state.inputValue, // don't clear the input string when typing after making a selection
                    };
                default:
                    return changes;
            }
        },
    });

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        whileElementsMounted: autoUpdate,
        placement: 'right',
        middleware: [shift(), offset({ mainAxis: 6 })],
    });

    const filterWordHighlighter = makeFilterWordMatcher(inputValue);

    const inputProps = getInputProps();

    // Floating UI and Downshift both want to set a ref, merge them into one
    const inputRef = (instance: any) => {
        refs.setReference(instance);
        (inputProps as any).ref(instance);
    };

    const enabledItems = items.filter(isEnabled);

    return (
        <>
            <StyledInput type="text" placeholder={placeholder} {...inputProps} ref={inputRef} />
            <FloatingPortal>
                <FullHeightDropdown ref={refs.setFloating} style={floatingStyles}>
                    <DropdownArea className={isOpen ? 'popup-open' : 'popup-closed'}>
                        <Popup
                            className="param-menu-content"
                            style={{ display: isOpen ? undefined : 'none' }}
                            {...getMenuProps(
                                {},
                                {
                                    // work around a bug in downshift that produces false
                                    // positive error messages when rendering in a portal
                                    suppressRefError: true,
                                }
                            )}
                        >
                            {isOpen &&
                                filteredItems.map((item, index) => {
                                    const enabled = isEnabled(item);
                                    return (
                                        <Item
                                            key={getKey(item)}
                                            className={enabled ? 'param-enabled' : undefined}
                                            {...getItemProps({ item, index })}
                                        >
                                            <EnabledMark type="checkbox" checked={enabled} readOnly />
                                            <ItemContent data-param-index={index}>
                                                <ItemLabel>
                                                    <EmphasiseMatches
                                                        matcher={filterWordHighlighter}
                                                        text={getLabel(item)}
                                                    />
                                                </ItemLabel>
                                                <ItemDocs>
                                                    <EmphasiseMatches
                                                        matcher={filterWordHighlighter}
                                                        text={getDocs(item)}
                                                    />
                                                </ItemDocs>
                                            </ItemContent>
                                        </Item>
                                    );
                                })}
                        </Popup>
                        {filteredItems.length === 0 && (
                            <NoSearchResultContainer>
                                <NoSearchResultMessage>
                                    No results for "<b>{inputValue}</b>"
                                </NoSearchResultMessage>
                            </NoSearchResultContainer>
                        )}
                    </DropdownArea>
                </FullHeightDropdown>
            </FloatingPortal>

            {enabledItems.map((item) => (
                <Fragment key={getKey(item)}>{renderEnabledItem(item)}</Fragment>
            ))}
        </>
    );
}

const getItemsMatchingFilter = <T,>(
    items: T[],
    filter: string,
    getLabel: (item: T) => string,
    getDocs: (item: T) => string,
    getKey: (item: T) => string
): T[] => {
    const pattern = filterPatternParts(filter, '.*', 'isd');
    if (!pattern) {
        return items;
    }
    return items.filter(
        (item) => pattern.test(getLabel(item)) || pattern.test(getDocs(item)) || pattern.test(getKey(item))
    );
};

const makeFilterWordMatcher = (filter: string): RegExp | null => filterPatternParts(filter, '|', 'isdg');

const filterPatternParts = (filter: string, separator: string, flags: string) => {
    const patternString = filter
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
        .map((word) => `\\b${word}\\w*`)
        .join(separator);
    if (!patternString) {
        return null;
    }
    return new RegExp(patternString, flags);
};

type EmphasiseMatchesProps = {
    text: string;
    matcher: RegExp | null;
};

const EmphasiseMatches = ({ matcher, text }: EmphasiseMatchesProps) => {
    if (!matcher) {
        return <>{text}</>;
    }
    const matches = [...text.matchAll(matcher)];

    const parts: ReactElement[] = [];
    let lastMatchEnd = 0;
    let lastMatch = '';
    for (let i = 0; i < matches.length; i++) {
        const matchStart = matches[i].index;
        let match = matches[i][0];
        const matchEnd = matchStart + match.length;
        const textBeforeMatch = text.slice(lastMatchEnd, matchStart);
        if (lastMatch && textBeforeMatch.match(/^\s*$/)) {
            // join adjacent words together into one match
            match = lastMatch + textBeforeMatch + match;
            parts.pop();
        } else if (textBeforeMatch) {
            parts.push(<Fragment key={lastMatchEnd}>{textBeforeMatch}</Fragment>);
        }
        parts.push(
            <span key={matchStart} className="filter-match">
                {match}
            </span>
        );
        lastMatch = match;
        lastMatchEnd = matchEnd;
    }
    const textAfterLastMatch = text.slice(lastMatchEnd);
    if (textAfterLastMatch) {
        parts.push(<Fragment key={lastMatchEnd}>{textAfterLastMatch}</Fragment>);
    }
    return <>{parts}</>;
};

const FullHeightDropdown = styled('div')`
    z-index: 10010; // above a sticky site header (e.g. Studio's z-index:10002) so the popup isn't hidden
    position: absolute;
    pointer-events: all;
    height: calc(100vh);
    position: relative;
`;

const DropdownArea = styled('div')`
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-bg-primary);
    border-radius: 6px;
    box-shadow: var(--shadow-md);

    position: absolute;
    top: 80px;
    bottom: 14px;
    overflow: auto;

    .param-menu-content {
        @keyframes scaleInUp {
            from {
                opacity: 0;
                transform: scale(0);
                transform: translateY(5px);
            }
            to {
                opacity: 1;
                transform: scale(1);
                transform: translateY(0px);
            }
        }

        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        animation: scaleInUp 0.1s;
    }

    &.popup-closed {
        display: none;
    }
`;

const Popup = styled('div')`
    display: flex;
    flex-direction: column;
    width: 380px;
`;

const NoSearchResultContainer = styled('div')`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
`;

const NoSearchResultMessage = styled('div')`
    width: 50%;
    text-align: center;
`;

const Item = styled('div')`
    --hover-color: var(--color-util-brand-100);

    padding: 8px;
    display: flex;
    gap: 8px;
    color: color-mix(in srgb, transparent, var(--color-fg-primary) 90%);
    transition: background-color 0.25s ease-in-out;
    cursor: pointer;

    &[aria-selected='true'] {
        background-color: var(--hover-color);
    }

    &[aria-selected='true'] input {
        border-color: var(--color-util-gray-400);
    }

    [data-dark-mode='true'] & {
        --hover-color: color-mix(in srgb, var(--color-util-gray-300) 40%, transparent);
    }

    &.param-enabled {
        color: var(--color-fg-primary);
    }
`;

const EnabledMark = styled('input')`
    margin-top: 1px;
`;

const ItemContent = styled('div')`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .filter-match {
        text-decoration: underline;
    }
`;

const ItemLabel = styled('div')`
    font-weight: var(--text-semibold);
    line-height: var(--text-lh-ratio-tight);
`;

const ItemDocs = styled('div')`
    font-size: var(--text-fs-xs);
    line-height: var(--text-lh-xs);
    color: var(--color-fg-secondary);
`;
