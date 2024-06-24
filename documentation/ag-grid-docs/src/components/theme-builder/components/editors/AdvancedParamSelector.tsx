import { allParamModels } from '@components/theme-builder/model/ParamModel';
import { useAdvancedParamIsEnabled, useSetAdvancedParamEnabled } from '@components/theme-builder/model/advanced-params';
import styled from '@emotion/styled';
import { FloatingPortal, autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import { useCombobox } from 'downshift';
import { Fragment, type ReactElement, useRef, useState } from 'react';

import { memoWithSameType } from '../component-utils';
import { Card } from '../general/Card';
import { StyledInput } from './Input';
import { ParamEditor } from './ParamEditor';

export const AdvancedParamSelector = memoWithSameType(() => {
    const [filteredParams, setFilteredParams] = useState(allParamModels());

    const advancedParamIsEnabled = useAdvancedParamIsEnabled();
    const setAdvancedParamEnabled = useSetAdvancedParamEnabled();

    const lastArrowKeyPressTime = useRef(0);

    const { isOpen, getMenuProps, getInputProps, getItemProps, inputValue } = useCombobox({
        onInputValueChange({ inputValue }) {
            setFilteredParams(getParamsMatchingFilter(inputValue));
        },
        items: filteredParams,
        itemToString(item) {
            return item ? item.label : '';
        },
        selectedItem: null,
        onSelectedItemChange: ({ selectedItem, type }) => {
            if (!selectedItem || type === useCombobox.stateChangeTypes.InputBlur) {
                return;
            }
            const enabled = advancedParamIsEnabled(selectedItem);
            setAdvancedParamEnabled(selectedItem, !enabled);
        },
        onHighlightedIndexChange: ({ highlightedIndex }) => {
            const wasKeyboardNavigation = Date.now() - lastArrowKeyPressTime.current < 100;
            if (!wasKeyboardNavigation) return;
            const popup = refs.floating.current;
            const item = popup?.querySelector(`[data-param-index="${highlightedIndex}"]`);
            if (!popup || !item) return;
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
                        inputValue: '', // don't clear the input string on blur
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
        middleware: [shift({ padding: 8 }), offset({ mainAxis: 6 })],
    });

    const filterWordHighlighter = makeFilterWordMatcher(inputValue);

    const inputProps = getInputProps();

    // Floating UI and Downshift both want to set a ref, merge them into one
    const inputRef = (instance: any) => {
        refs.setReference(instance);
        (inputProps as any).ref(instance);
    };

    const enabledParams = allParamModels().filter((param) => advancedParamIsEnabled(param));

    return (
        <>
            <StyledInput type="text" placeholder="Search theme params..." {...inputProps} ref={inputRef} />
            <FloatingPortal>
                <DropdownArea
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className={isOpen ? 'popup-open' : 'popup-closed'}
                >
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
                            filteredParams.map((param, index) => {
                                const enabled = advancedParamIsEnabled(param);
                                return (
                                    <Param
                                        key={param.property}
                                        className={enabled ? 'param-enabled' : undefined}
                                        {...getItemProps({ item: param, index })}
                                    >
                                        <EnabledMark type="checkbox" checked={enabled} readOnly />
                                        <ParamContent data-param-index={index}>
                                            <ParamLabel>
                                                <EmphasiseMatches matcher={filterWordHighlighter} text={param.label} />
                                            </ParamLabel>
                                            <ParamDocs>
                                                <EmphasiseMatches matcher={filterWordHighlighter} text={param.docs} />
                                            </ParamDocs>
                                        </ParamContent>
                                    </Param>
                                );
                            })}
                    </Popup>
                    {filteredParams.length === 0 && (
                        <NoSearchResultContainer>
                            <NoSearchResultMessage>No results for "{inputValue}"</NoSearchResultMessage>
                        </NoSearchResultContainer>
                    )}
                </DropdownArea>
            </FloatingPortal>

            {enabledParams.map((param) => (
                <ParamEditor key={param.property} param={param} showDocs isAdvancedSection />
            ))}
        </>
    );
});

const DropdownArea = styled(Card)`
    z-index: 1000;
    position: absolute;
    pointer-events: all;
    height: calc(100vh - 16px);
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
    width: calc(100vw - 350px);
    max-width: 550px;
`;

const NoSearchResultContainer = styled('div')`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
`;

const NoSearchResultMessage = styled(Card)`
    width: 50%;
    border: 1px solid var(--color-border-primary);
    padding: 16px;
    background-color: var(--color-bg-primary);
    text-align: center;
`;

const Param = styled('div')`
    --hover-color: var(--color-util-brand-100);

    padding: 6px 8px;
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
    margin-top: 4px;
`;

const ParamContent = styled('div')`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .filter-match {
        text-decoration: underline;
    }
`;

const ParamLabel = styled('div')`
    font-weight: 500;
`;

const ParamDocs = styled('div')`
    font-size: 0.8em;
`;

const getParamsMatchingFilter = (filter: string) => {
    const pattern = filterPatternParts(filter, '.*', 'isd');
    if (!pattern) return allParamModels();
    return allParamModels().filter(
        (pm) => pattern.test(pm.label) || pattern.test(pm.docs) || pattern.test(pm.property)
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
    if (!patternString) return null;
    return new RegExp(patternString, flags);
};

type EmphasiseMatchesProps = {
    text: string;
    matcher: RegExp | null;
};

const EmphasiseMatches = ({ matcher, text }: EmphasiseMatchesProps) => {
    if (!matcher) return <>{text}</>;
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
