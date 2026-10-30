import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { stripFloatingPointErrors } from '../../theming/utils';
import { Input } from './Input';
import './formatted-input-global-styles.css';

export type FormattedInputProps = {
    value: string;
    onChange?: (newValue: string) => void;
    onClear?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    ariaLabel?: string;
    valueToEditingString?: (value: string) => string;
    /**
     * Return the value for an editing string, or null if invalid
     */
    validateEditingString?: (editingString: string) => string | null;
    valueToDisplayString?: (value: string) => string;
    icon?: ReactNode;
    onIconClick?: () => void;
    getIconSwipeAdjustment?: (value: string, amount: number) => string;
};

export const FormattedInput = ({
    value,
    onChange,
    onClear,
    onFocus,
    onBlur,
    ariaLabel,
    valueToEditingString = String,
    validateEditingString: editingStringToValue = String,
    valueToDisplayString = String,
    icon,
    onIconClick,
    getIconSwipeAdjustment,
}: FormattedInputProps) => {
    const [editorValue, setEditorValue] = useState(() => valueToDisplayString(value));
    const hasFocus = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!hasFocus.current) {
            setEditorValue(valueToDisplayString(value));
        }
        // intentionally omitting valueToDisplayString to avoid re-running on function identity changes
    }, [value]);

    const isValid = useMemo(
        () => (editorValue === '' ? true : editingStringToValue(editorValue) != null),
        // intentionally omitting editingStringToValue to avoid re-running on function identity changes
        [editorValue]
    );

    const handleInput = (newEditorValue: string) => {
        newEditorValue = newEditorValue.trim();
        setEditorValue(newEditorValue);
        if (newEditorValue === '') {
            onClear?.();
        } else {
            const newValue = editingStringToValue(newEditorValue);
            if (newValue != null) {
                onChange?.(newValue);
            }
        }
    };

    return (
        <Wrapper>
            <Input
                ref={inputRef}
                ariaLabel={ariaLabel}
                className={isValid ? undefined : 'is-error'}
                value={editorValue}
                onChange={handleInput}
                onFocus={() => {
                    hasFocus.current = true;
                    setEditorValue(valueToEditingString(value));
                    onFocus?.();
                }}
                onBlur={() => {
                    hasFocus.current = false;
                    setEditorValue(valueToDisplayString(value));
                    onBlur?.();
                }}
                onKeyDown={(e) => {
                    if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        e.preventDefault();
                    }

                    const adjustBy = (amount: number) => {
                        const current = parseFloat(editorValue) || 0;
                        const adjusted = Math.max(0, current + amount);
                        const string = stripFloatingPointErrors(adjusted);
                        handleInput(string);
                    };
                    const amount = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ? 10 : 1;
                    if (e.key === 'ArrowUp') {
                        adjustBy(amount);
                    } else if (e.key === 'ArrowDown') {
                        adjustBy(-amount);
                    }
                }}
                additionalPaddingLeft={icon ? 26 : 0}
            />
            {icon && (
                <IconWrapper
                    onClick={() => {
                        inputRef.current?.focus();
                        onIconClick?.();
                    }}
                    cursor={getIconSwipeAdjustment ? 'ew-resize' : undefined}
                    onPointerDown={
                        getIconSwipeAdjustment
                            ? (e) => {
                                  if (e.button !== 0) {
                                      return;
                                  }
                                  e.preventDefault();
                                  const wrapper = e.currentTarget;
                                  wrapper.setPointerCapture(e.pointerId);
                                  inputRef.current?.blur();
                                  const startX = e.clientX;
                                  const startY = e.clientY;
                                  document.body.classList.add('force-resize-cursor');
                                  const handleMove = (e: PointerEvent) => {
                                      const movementX = e.clientX - startX;
                                      const movementY = startY - e.clientY; // invert Y movement so up is higher
                                      const movement =
                                          Math.abs(movementX) > Math.abs(movementY) ? movementX : movementY;
                                      onChange?.(getIconSwipeAdjustment(value, movement));
                                  };
                                  // Capture ends however the drag does, including a cancel that never sends pointerup.
                                  const handleEnd = () => {
                                      wrapper.removeEventListener('pointermove', handleMove);
                                      wrapper.removeEventListener('lostpointercapture', handleEnd);
                                      document.body.classList.remove('force-resize-cursor');
                                  };
                                  wrapper.addEventListener('pointermove', handleMove);
                                  wrapper.addEventListener('lostpointercapture', handleEnd);
                              }
                            : undefined
                    }
                >
                    {icon}
                </IconWrapper>
            )}
        </Wrapper>
    );
};

const Wrapper = styled('div')`
    position: relative;
`;

const IconWrapper = styled('div')`
    position: absolute;
    top: 50%;
    margin-top: -11px;
    left: 6px;
    width: 22px;
    height: 22px;
    cursor: ${(props: { cursor?: string }) => props.cursor || 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.7);

    svg,
    svg * {
        stroke: var(--color-brand-400);
        stroke-width: 2.2px;

        [data-dark-mode='true'] & {
            stroke: var(--color-brand-300);
        }
    }
`;
